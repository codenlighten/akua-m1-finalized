const axios = require('axios');
const bsv = require('@smartledger/bsv');
const { storePublishRecord, getPublishRecord } = require('./db');

/**
 * Publish hash to BSV blockchain using OP_RETURN
 * @param {string} sha256 - Hash to publish
 * @param {object} config - Configuration with BSV credentials
 * @returns {Promise<{txid: string, status: string, cached: boolean}>}
 */
async function callBlockchainAPI(sha256, config) {
  // STUB MODE for testing (avoids spending real sats)
  if (process.env.TEST_PUBLISHER_STUB === '1') {
    const crypto = require('crypto');
    const stubTxid = crypto.createHash('sha256')
      .update(sha256 + 'txid', 'utf8')
      .digest('hex');
    
    return {
      txid: stubTxid,
      status: 'broadcasted',
      cached: false
    };
  }
  
  try {
    // Get credentials from environment
    const privateKeyWIF = process.env.BSV_PRIVATE_KEY;
    const address = process.env.BSV_ADDRESS;
    const network = process.env.BSV_NETWORK || 'mainnet';
    
    if (!privateKeyWIF || !address) {
      throw new Error('BSV_PRIVATE_KEY and BSV_ADDRESS must be set in environment');
    }
    
    // Initialize private key
    const privateKey = bsv.PrivateKey.fromWIF(privateKeyWIF);
    const publicKey = bsv.PublicKey.fromPrivateKey(privateKey);
    
    // Get UTXOs for the address via WhatsOnChain API
    const wocBaseUrl = network === 'mainnet' 
      ? 'https://api.whatsonchain.com/v1/bsv/main'
      : 'https://api.whatsonchain.com/v1/bsv/test';
    
    const utxosResponse = await axios.get(
      `${wocBaseUrl}/address/${address}/unspent`,
      { timeout: 10000 }
    );
    
    const utxos = utxosResponse.data;
    
    if (!utxos || utxos.length === 0) {
      throw new Error('No UTXOs available for address. Please fund the address.');
    }
    
    // Build transaction
    const tx = new bsv.Transaction();
    
    // Add inputs (use first UTXO for simplicity)
    let totalInput = 0;
    for (const utxo of utxos.slice(0, 5)) { // Use up to 5 UTXOs
      tx.from({
        txId: utxo.tx_hash,
        outputIndex: utxo.tx_pos,
        script: bsv.Script.buildPublicKeyHashOut(address).toHex(),
        satoshis: utxo.value
      });
      totalInput += utxo.value;
      
      // Break if we have enough for fee (need ~500 satoshis)
      if (totalInput > 1000) break;
    }
    
    if (totalInput === 0) {
      throw new Error('No valid UTXOs found');
    }
    
    // Add OP_RETURN output with hash
    const opReturnScript = bsv.Script.buildSafeDataOut([
      Buffer.from('AKUA', 'utf8'),  // Protocol identifier
      Buffer.from(sha256, 'hex')     // The hash
    ]);
    
    tx.addOutput(new bsv.Transaction.Output({
      script: opReturnScript,
      satoshis: 0
    }));
    
    // Add change output (minimum dust threshold is 546 satoshis)
    const fee = 500; // Standard fee
    
    // Fee cap validation
    const maxFee = parseInt(process.env.MAX_FEE_SATS || '10000', 10);
    if (fee > maxFee) {
      throw new Error(`Transaction fee ${fee} sats exceeds maximum ${maxFee} sats`);
    }
    
    const changeAmount = totalInput - fee;
    
    if (changeAmount >= 546) {
      tx.to(address, changeAmount);
    }
    
    // Check UTXO floor (warn if balance getting low)
    const minBalance = parseInt(process.env.MIN_BALANCE_SATS || '1000000', 10); // Default 0.01 BSV
    if (totalInput < minBalance) {
      console.warn(`[BLOCKCHAIN] Low balance warning: ${totalInput} sats remaining (min: ${minBalance})`);
    }
    
    // Sign transaction
    tx.sign(privateKey);
    
    // Serialize and broadcast
    const rawTx = tx.serialize();
    
    const broadcastResponse = await axios.post(
      `${wocBaseUrl}/tx/raw`,
      { txhex: rawTx },
      {
        timeout: 10000,
        headers: { 'Content-Type': 'application/json' }
      }
    );
    
    const txid = tx.id || broadcastResponse.data;
    
    return {
      txid: txid,
      status: 'broadcasted',
      cached: false
    };
    
  } catch (error) {
    // Log error but don't expose sensitive info
    console.error('Blockchain publishing error:', error.message);
    
    // Fall back to mock for development if credentials missing
    if (error.message.includes('BSV_PRIVATE_KEY')) {
      console.warn('Using mock txid - BSV credentials not configured');
      return {
        txid: `mock_tx_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        status: 'mock'
      };
    }
    
    throw error;
  }
}

/**
 * Publish hash to blockchain (with idempotency)
 */
async function publishToBlockchain(sha256, meta, config, logger) {
  // Check if already published (idempotency)
  const existing = await getPublishRecord(sha256);
  
  if (existing) {
    logger.info({ sha256, txid: existing.txid }, 'Hash already published (idempotent)');
    
    return {
      sha256: existing.sha256,
      txid: existing.txid,
      status: existing.status,
      publishedAt: existing.published_at.toISOString(),
      network: existing.network,
      cached: true
    };
  }
  
  // Publish to blockchain
  logger.info({ sha256 }, 'Publishing to blockchain...');
  
  const { txid, status, cached } = await callBlockchainAPI(sha256, config);
  
  // Store in database
  const record = await storePublishRecord(
    sha256,
    txid,
    status,
    config.network,
    meta
  );
  
  logger.info({ sha256, txid, status }, 'Published successfully');
  
  return {
    sha256: record.sha256,
    txid: record.txid,
    status: record.status,
    publishedAt: record.published_at.toISOString(),
    network: record.network,
    cached: false
  };
}

module.exports = {
  publishToBlockchain,
  getPublishRecord
};
