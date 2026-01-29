const express = require('express');
const pino = require('pino');
const { connectRabbitMQ, startConsumer } = require('./rabbitmq');

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
  rabbitUrl: process.env.RABBIT_URL || 'amqp://localhost:5672',
  inQueue: process.env.IN_QUEUE || 'iot.payload.in',
  outQueue: process.env.OUT_QUEUE || 'iot.payload.out',
  dlqQueue: process.env.DLQ_QUEUE || 'iot.payload.in.dlq',
  maxAttempts: parseInt(process.env.MAX_ATTEMPTS || '5', 10),
  publisherUrl: process.env.PUBLISHER_URL || 'http://localhost:8081/publish',
  publisherTimeout: parseInt(process.env.PUBLISHER_TIMEOUT_MS || '8000', 10),
  prefetch: parseInt(process.env.RABBIT_PREFETCH || '20', 10)
};

// Express app for health checks
const app = express();

app.get('/healthz', (req, res) => {
  res.json({ ok: true, service: 'hashsvc', version: '1.0.0' });
});

app.get('/metrics', (req, res) => {
  // TODO: Add Prometheus metrics
  res.json({
    service: 'hashsvc',
    uptime: process.uptime(),
    memory: process.memoryUsage()
  });
});

// Graceful shutdown
let rabbitConnection = null;
let rabbitChannel = null;

async function shutdown(signal) {
  logger.info(`Received ${signal}, shutting down gracefully...`);
  
  if (rabbitChannel) {
    await rabbitChannel.close();
    logger.info('RabbitMQ channel closed');
  }
  
  if (rabbitConnection) {
    await rabbitConnection.close();
    logger.info('RabbitMQ connection closed');
  }
  
  process.exit(0);
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// Main
async function main() {
  try {
    logger.info('Starting AKUA Hash+Envelope Service...');
    logger.info({ config }, 'Configuration');

    // Start HTTP server
    app.listen(config.port, () => {
      logger.info(`HTTP server listening on port ${config.port}`);
    });

    // Connect to RabbitMQ
    const { connection, channel } = await connectRabbitMQ(config, logger);
    rabbitConnection = connection;
    rabbitChannel = channel;

    // Start consuming messages
    await startConsumer(channel, config, logger);

    logger.info('Service started successfully');
  } catch (error) {
    logger.error({ error }, 'Failed to start service');
    process.exit(1);
  }
}

main();
