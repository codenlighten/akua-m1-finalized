const axios = require('axios');

/**
 * Call the Publisher service to publish a hash to blockchain
 * @param {string} publisherUrl - Publisher service URL
 * @param {string} sha256 - Hash to publish
 * @param {object} meta - Metadata
 * @param {number} timeout - Timeout in ms
 * @returns {Promise<object>} - Publisher response {sha256, txid, status, publishedAt, network}
 */
async function publishHash(publisherUrl, sha256, meta, timeout) {
  const payload = {
    sha256,
    meta,
    options: {
      idempotencyKey: sha256 // Use hash itself as idempotency key
    }
  };

  const headers = {
    'Content-Type': 'application/json'
  };

  // Add auth token if configured (M2 hardening)
  const authToken = process.env.PUBLISHER_AUTH_TOKEN;
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  const response = await axios.post(publisherUrl, payload, {
    timeout,
    headers
  });

  return response.data;
}

/**
 * Check if error is transient (should retry)
 * @param {Error} error - Error object
 * @returns {boolean} - True if transient
 */
function isTransientError(error) {
  if (!error.response) {
    // Network errors, timeouts
    return true;
  }

  const status = error.response.status;
  
  // 5xx errors are transient
  if (status >= 500) {
    return true;
  }

  // 429 Too Many Requests is transient
  if (status === 429) {
    return true;
  }

  // 408 Request Timeout is transient
  if (status === 408) {
    return true;
  }

  // Everything else (4xx) is permanent
  return false;
}

module.exports = {
  publishHash,
  isTransientError
};
