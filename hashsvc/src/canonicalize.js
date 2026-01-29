const crypto = require('crypto');

/**
 * Recursively sort object keys for deterministic JSON serialization
 * @param {any} obj - Object to canonicalize
 * @returns {any} - Canonicalized object
 */
function canonicalize(obj) {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (Array.isArray(obj)) {
    // Arrays: preserve order, canonicalize elements
    return obj.map(item => canonicalize(item));
  }

  if (typeof obj === 'object') {
    // Objects: sort keys lexicographically
    const sorted = {};
    const keys = Object.keys(obj).sort();
    
    for (const key of keys) {
      sorted[key] = canonicalize(obj[key]);
    }
    
    return sorted;
  }

  // Primitives: return as-is
  return obj;
}

/**
 * Create canonical JSON string from object
 * @param {object} obj - Object to canonicalize
 * @returns {string} - Canonical JSON string
 */
function canonicalJSON(obj) {
  const canonical = canonicalize(obj);
  return JSON.stringify(canonical);
}

/**
 * Create SHA-256 hash of canonical JSON
 * @param {object} obj - Object to hash
 * @returns {string} - Hex-encoded SHA-256 hash (64 chars)
 */
function hashObject(obj) {
  const canonical = canonicalJSON(obj);
  const hash = crypto.createHash('sha256');
  hash.update(canonical, 'utf8');
  return hash.digest('hex');
}

module.exports = {
  canonicalize,
  canonicalJSON,
  hashObject
};
