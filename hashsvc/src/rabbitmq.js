const amqp = require('amqplib');
const { hashObject, canonicalJSON } = require('./canonicalize');
const { publishHash, isTransientError } = require('./publisher-client');

/**
 * Connect to RabbitMQ and setup channel
 */
async function connectRabbitMQ(config, logger) {
  logger.info({ url: config.rabbitUrl }, 'Connecting to RabbitMQ...');
  
  const connection = await amqp.connect(config.rabbitUrl);
  const channel = await connection.createChannel();
  
  // Set prefetch
  await channel.prefetch(config.prefetch);
  
  // Assert queues exist
  await channel.assertQueue(config.inQueue, { durable: true });
  await channel.assertQueue(config.outQueue, { durable: true });
  await channel.assertQueue(config.dlqQueue, { durable: true });
  
  logger.info('RabbitMQ connected and queues asserted');
  
  return { connection, channel };
}

/**
 * Extract payload to hash from message
 * Supports both wrapped ({data: ...}) and raw formats
 */
function extractPayload(messageBody) {
  if (messageBody.data && typeof messageBody.data === 'object') {
    // Form B: wrapped format
    return messageBody.data;
  }
  
  // Form A: raw format
  return messageBody;
}

/**
 * Process a single message
 */
async function processMessage(msg, channel, config, logger) {
  const startTime = Date.now();
  const attempts = (msg.properties.headers?.['x-attempts'] || 0) + 1;
  
  try {
    // Parse message
    const messageBody = JSON.parse(msg.content.toString());
    const receivedAt = new Date().toISOString();
    
    logger.info({
      correlationId: msg.properties.correlationId,
      messageId: msg.properties.messageId,
      attempt: attempts
    }, 'Processing message');
    
    // Extract payload to hash
    const payload = extractPayload(messageBody);
    
    // Validate payload is an object
    if (typeof payload !== 'object' || payload === null || Array.isArray(payload)) {
      throw new Error('Payload must be a JSON object');
    }
    
    // Canonicalize and hash
    const canonical = canonicalJSON(payload);
    const sha256 = hashObject(payload);
    
    logger.debug({ sha256, canonical: canonical.substring(0, 100) }, 'Hash computed');
    
    // Publish to blockchain
    const meta = {
      sourceId: messageBody.sourceId || null,
      receivedAt,
      correlationId: msg.properties.correlationId || null,
      messageId: msg.properties.messageId || null,
      schema: messageBody.schema || null
    };
    
    const publishResult = await publishHash(
      config.publisherUrl,
      sha256,
      meta,
      config.publisherTimeout
    );
    
    logger.info({
      sha256,
      txid: publishResult.txid,
      status: publishResult.status
    }, 'Hash published to blockchain');
    
    // Create receipt
    const receipt = {
      version: '1',
      original: payload,
      canonical,
      sha256,
      txid: publishResult.txid,
      publisher: {
        network: publishResult.network,
        status: publishResult.status,
        cached: Boolean(publishResult.cached) // M2: strict boolean for observable idempotency
      },
      meta
    };
    
    // Publish receipt to OUT queue
    await channel.sendToQueue(
      config.outQueue,
      Buffer.from(JSON.stringify(receipt)),
      {
        persistent: true,
        contentType: 'application/json',
        correlationId: msg.properties.correlationId,
        messageId: msg.properties.messageId
      }
    );
    
    // ACK message
    channel.ack(msg);
    
    const duration = Date.now() - startTime;
    logger.info({ duration, txid: publishResult.txid }, 'Message processed successfully');
    
  } catch (error) {
    const duration = Date.now() - startTime;
    
    logger.error({
      error: error.message,
      stack: error.stack,
      attempt: attempts,
      duration
    }, 'Error processing message');
    
    // Determine if we should retry
    const shouldRetry = isTransientError(error) && attempts < config.maxAttempts;
    
    if (shouldRetry) {
      // NACK with requeue
      logger.info({ attempt: attempts, maxAttempts: config.maxAttempts }, 'Retrying message');
      
      channel.nack(msg, false, false); // Don't requeue immediately
      
      // Re-publish with incremented attempt counter
      await channel.sendToQueue(
        config.inQueue,
        msg.content,
        {
          ...msg.properties,
          headers: {
            ...msg.properties.headers,
            'x-attempts': attempts
          }
        }
      );
    } else {
      // Send to DLQ
      logger.warn({ attempts, reason: error.message }, 'Sending message to DLQ');
      
      await channel.sendToQueue(
        config.dlqQueue,
        msg.content,
        {
          ...msg.properties,
          headers: {
            ...msg.properties.headers,
            'x-attempts': attempts,
            'x-error': error.message,
            'x-failed-at': new Date().toISOString()
          }
        }
      );
      
      // ACK original message
      channel.ack(msg);
    }
  }
}

/**
 * Start consuming messages from IN queue
 */
async function startConsumer(channel, config, logger) {
  logger.info({ queue: config.inQueue }, 'Starting consumer...');
  
  await channel.consume(
    config.inQueue,
    async (msg) => {
      if (msg === null) {
        return;
      }
      
      await processMessage(msg, channel, config, logger);
    },
    {
      noAck: false // Manual acknowledgment
    }
  );
  
  logger.info('Consumer started');
}

module.exports = {
  connectRabbitMQ,
  startConsumer
};
