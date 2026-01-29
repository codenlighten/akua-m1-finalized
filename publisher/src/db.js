const { Pool } = require('pg');

let pool = null;

/**
 * Initialize database connection pool
 */
async function initDB(databaseUrl, logger) {
  logger.info('Initializing database connection...');
  
  pool = new Pool({
    connectionString: databaseUrl,
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000
  });
  
  // Test connection
  const client = await pool.connect();
  
  // Create table if not exists
  await client.query(`
    CREATE TABLE IF NOT EXISTS publish_records (
      id SERIAL PRIMARY KEY,
      sha256 VARCHAR(64) UNIQUE NOT NULL,
      txid VARCHAR(255) NOT NULL,
      status VARCHAR(50) NOT NULL,
      network VARCHAR(50) NOT NULL,
      meta JSONB,
      published_at TIMESTAMP NOT NULL DEFAULT NOW(),
      created_at TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `);
  
  // Create index on sha256
  await client.query(`
    CREATE INDEX IF NOT EXISTS idx_publish_records_sha256 
    ON publish_records(sha256)
  `);
  
  client.release();
  
  logger.info('Database initialized successfully');
}

/**
 * Get database pool
 */
function getPool() {
  if (!pool) {
    throw new Error('Database not initialized');
  }
  return pool;
}

/**
 * Close database connection
 */
async function closeDB() {
  if (pool) {
    await pool.end();
    pool = null;
  }
}

/**
 * Store publish record (idempotent)
 */
async function storePublishRecord(sha256, txid, status, network, meta) {
  const query = `
    INSERT INTO publish_records (sha256, txid, status, network, meta, published_at)
    VALUES ($1, $2, $3, $4, $5, NOW())
    ON CONFLICT (sha256) DO NOTHING
    RETURNING *
  `;
  
  const result = await pool.query(query, [sha256, txid, status, network, meta]);
  
  // If no rows returned, record already exists - fetch it
  if (result.rows.length === 0) {
    const fetchQuery = 'SELECT * FROM publish_records WHERE sha256 = $1';
    const fetchResult = await pool.query(fetchQuery, [sha256]);
    return fetchResult.rows[0];
  }
  
  return result.rows[0];
}

/**
 * Get publish record by sha256
 */
async function getPublishRecord(sha256) {
  const query = 'SELECT * FROM publish_records WHERE sha256 = $1';
  const result = await pool.query(query, [sha256]);
  
  return result.rows.length > 0 ? result.rows[0] : null;
}

module.exports = {
  initDB,
  getPool,
  closeDB,
  storePublishRecord,
  getPublishRecord
};
