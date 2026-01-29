const express = require('express');
const pino = require('pino');
const crypto = require('crypto');
const { initDB, closeDB } = require('./db');
const { publishToBlockchain, getPublishRecord } = require('./blockchain');

// Logger
const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'SYS:standard',
      ignore: 'pid,hostname'
    }
  }
});

// Config
const config = {
  port: parseInt(process.env.PORT || '8080', 10),
  databaseUrl: process.env.DATABASE_URL || 'postgres://publisher:publisher_pass@localhost:5432/publisher',
  network: process.env.NETWORK || 'testnet',
  blockchainPublishUrl: process.env.BLOCKCHAIN_PUBLISH_URL || null,
  publishApiKey: process.env.PUBLISH_API_KEY || null,
  authToken: process.env.PUBLISHER_AUTH_TOKEN || null, // Internal auth
  maxFee: parseInt(process.env.MAX_FEE_SATS || '10000', 10), // Max tx fee in sats
  rateLimit: parseInt(process.env.RATE_LIMIT_PER_MIN || '100', 10) // Max publishes/min
};

// Rate limiting (simple in-memory counter)
const rateLimiter = {
  counts: new Map(),
  windowMs: 60000, // 1 minute
  
  check(key) {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    
    // Clean old entries
    for (const [k, timestamps] of this.counts.entries()) {
      const filtered = timestamps.filter(t => t > windowStart);
      if (filtered.length === 0) {
        this.counts.delete(k);
      } else {
        this.counts.set(k, filtered);
      }
    }
    
    // Check current key
    const timestamps = this.counts.get(key) || [];
    if (timestamps.length >= config.rateLimit) {
      return false; // Rate limit exceeded
    }
    
    // Add current request
    timestamps.push(now);
    this.counts.set(key, timestamps);
    return true;
  }
};

// Auth middleware (optional - only if PUBLISHER_AUTH_TOKEN is set)
function authMiddleware(req, res, next) {
  // Skip auth if no token configured
  if (!config.authToken) {
    return next();
  }
  
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Missing or invalid authorization header'
    });
  }
  
  const token = authHeader.substring(7);
  
  // Timing-safe comparison to prevent timing attacks
  const tokenValid = (() => {
    try {
      const tokenBuf = Buffer.from(token);
      const configBuf = Buffer.from(config.authToken);
      if (tokenBuf.length !== configBuf.length) return false;
      return crypto.timingSafeEqual(tokenBuf, configBuf);
    } catch {
      return false;
    }
  })();
  
  if (!tokenValid) {
    return res.status(403).json({
      error: 'Forbidden',
      message: 'Invalid authorization token'
    });
  }
  
  next();
}

// Express app
const app = express();
app.use(express.json());

// Health check
app.get('/healthz', (req, res) => {
  res.json({ ok: true, service: 'publisher', version: '2.0.0-m2' });
});

// Metrics
app.get('/metrics', (req, res) => {
  res.json({
    service: 'publisher',
    uptime: process.uptime(),
    memory: process.memoryUsage()
  });
});

// Info - capabilities and configuration (M2)
// Protected with auth to prevent config disclosure if port exposed
app.get('/info', authMiddleware, (req, res) => {
  const stubMode = process.env.TEST_PUBLISHER_STUB === '1';
  res.json({
    version: '2.0.0-m2',
    network: config.network,
    stubMode,
    authEnabled: !!config.authToken,
    rateLimitPerMin: config.rateLimit,
    maxFeeSats: config.maxFee
  });
});

// POST /publish - Publish a hash to blockchain
app.post('/publish', authMiddleware, async (req, res) => {
  try {
    const { sha256, meta = {}, options = {} } = req.body;
    
    // Validate sha256
    if (!sha256 || typeof sha256 !== 'string' || !/^[a-f0-9]{64}$/i.test(sha256)) {
      return res.status(400).json({
        error: 'Invalid sha256',
        message: 'sha256 must be a 64-character hex string'
      });
    }
    
    // Rate limiting (by IP or sha256 hash prefix for uniqueness)
    const rateLimitKey = req.ip || sha256.substring(0, 16);
    if (!rateLimiter.check(rateLimitKey)) {
      return res.status(429).json({
        error: 'Rate limit exceeded',
        message: `Maximum ${config.rateLimit} publishes per minute`
      });
    }
    
    logger.info({ sha256, meta }, 'Publishing hash to blockchain');
    
    // Publish (with idempotency)
    const result = await publishToBlockchain(sha256, meta, config, logger);
    
    res.json(result);
    
  } catch (error) {
    logger.error({ error: error.message, stack: error.stack }, 'Error publishing hash');
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

// GET /publish/:sha256 - Get publish record
app.get('/publish/:sha256', async (req, res) => {
  try {
    const { sha256 } = req.params;
    
    // Validate sha256
    if (!/^[a-f0-9]{64}$/i.test(sha256)) {
      return res.status(400).json({
        error: 'Invalid sha256',
        message: 'sha256 must be a 64-character hex string'
      });
    }
    
    const record = await getPublishRecord(sha256);
    
    if (!record) {
      return res.status(404).json({
        error: 'Not found',
        message: 'No publish record found for this hash'
      });
    }
    
    res.json(record);
    
  } catch (error) {
    logger.error({ error: error.message }, 'Error fetching publish record');
    res.status(500).json({
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Graceful shutdown
async function shutdown(signal) {
  logger.info(`Received ${signal}, shutting down gracefully...`);
  
  await closeDB();
  
  process.exit(0);
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// Main
async function main() {
  try {
    logger.info('Starting AKUA Publisher Service...');

    // M2: Stub mode safety guard
    const stubMode = process.env.TEST_PUBLISHER_STUB === '1';
    const isMainnet = config.network === 'mainnet';
    const allowStubOnMainnet = process.env.ALLOW_STUB_ON_MAINNET === 'true';
    
    if (stubMode && isMainnet && !allowStubOnMainnet) {
      logger.warn('⚠️  WARNING: TEST_PUBLISHER_STUB=1 with NETWORK=mainnet');
      logger.warn('⚠️  Stub mode will NOT broadcast real transactions!');
      logger.warn('⚠️  Set ALLOW_STUB_ON_MAINNET=true to suppress this warning.');
      logger.warn('⚠️  Set TEST_PUBLISHER_STUB=0 for production blockchain publishing.');
    }
    
    if (stubMode) {
      logger.info('🔧 Stub mode ENABLED - generating deterministic fake txids (no blockchain API calls)');
    } else {
      logger.info('🚀 Production mode - broadcasting to BSV blockchain');
    }
    
    // Config summary (with redaction)
    logger.info({
      stubMode,
      network: config.network,
      authEnabled: !!config.authToken,
      rateLimitPerMin: config.rateLimit,
      maxFeeSats: config.maxFee,
      minBalanceSats: parseInt(process.env.MIN_BALANCE_SATS || '1000000', 10)
    }, 'Publisher config summary');

    // Initialize database
    await initDB(config.databaseUrl, logger);

    // Start HTTP server
    app.listen(config.port, () => {
      logger.info(`Publisher service listening on port ${config.port}`);
    });

    logger.info('Service started successfully');
  } catch (error) {
    logger.error({ error }, 'Failed to start service');
    process.exit(1);
  }
}

main();
