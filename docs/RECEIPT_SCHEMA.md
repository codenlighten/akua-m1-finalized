# AKUA Receipt Schema Documentation

## Overview

Every message processed by the AKUA Hash+Envelope service produces a receipt that is published to the `iot.payload.out` queue. This receipt provides complete traceability and verification of the blockchain anchoring process.

---

## Schema Version 1

### Complete Example

```json
{
  "version": "1",
  "original": {
    "deviceId": "AKUA-TEST-001",
    "tempC": 22.4,
    "ts": "2026-01-28T00:00:00Z"
  },
  "canonical": "{\"deviceId\":\"AKUA-TEST-001\",\"tempC\":22.4,\"ts\":\"2026-01-28T00:00:00Z\"}",
  "sha256": "0952cb262572882a17ab8010251ba9079749648d08ff75b2e9d8bb1339add8c5",
  "txid": "8ae3c7cc76bf6d34d83337d9f56b6be85e2ed85ebd9d12667625eeaf5893415a",
  "publisher": {
    "network": "mainnet",
    "status": "broadcasted"
  },
  "meta": {
    "sourceId": null,
    "receivedAt": "2026-01-29T03:27:04.714Z",
    "correlationId": null,
    "messageId": null,
    "schema": null
  }
}
```

---

## Field Definitions

### Top-Level Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `version` | string | Yes | Schema version (currently "1") |
| `original` | object | Yes | Original IoT payload (unmodified) |
| `canonical` | string | Yes | Canonical JSON representation for reproducibility |
| `sha256` | string | Yes | SHA-256 hash of canonical JSON (64 hex chars) |
| `txid` | string | Yes | Bitcoin SV transaction ID (64 hex chars) |
| `publisher` | object | Yes | Blockchain publisher metadata |
| `meta` | object | Yes | Processing metadata |

---

### `original` Object

The **exact** payload received from the IoT device, preserved without modification. This allows downstream systems to access the original data structure.

**Example:**
```json
{
  "deviceId": "AKUA-TEST-001",
  "tempC": 22.4,
  "ts": "2026-01-28T00:00:00Z"
}
```

**Timestamp Convention:**
- If the original payload contains a `ts` or `timestamp` field, this represents the **device-provided timestamp** (when the sensor reading was taken).
- This may differ from `meta.receivedAt`, which is the server processing time.

---

### `canonical` Field

A **deterministic** JSON string with lexicographically sorted keys, used to compute the SHA-256 hash. This ensures that:

1. **Idempotency:** Payloads with different key order produce the same hash.
2. **Reproducibility:** Anyone can verify the hash by re-canonicalizing the original payload.

**Example:**
```json
"canonical": "{\"deviceId\":\"AKUA-TEST-001\",\"tempC\":22.4,\"ts\":\"2026-01-28T00:00:00Z\"}"
```

**Canonicalization Rules:**
- Object keys sorted lexicographically (alphabetically)
- Arrays preserve element order
- Nested objects recursively sorted
- No whitespace in JSON output
- UTF-8 encoding

---

### `sha256` Field

The **SHA-256 hash** of the canonical JSON string, represented as **64 lowercase hexadecimal characters**.

**Format:** `^[0-9a-f]{64}$`

**Example:**
```
0952cb262572882a17ab8010251ba9079749648d08ff75b2e9d8bb1339add8c5
```

**Verification:**
```bash
echo -n '{"deviceId":"AKUA-TEST-001","tempC":22.4,"ts":"2026-01-28T00:00:00Z"}' | sha256sum
```

---

### `txid` Field

The **Bitcoin SV transaction ID** where the hash was anchored on-chain via OP_RETURN.

**Format:** `^[0-9a-f]{64}$`

**Example:**
```
8ae3c7cc76bf6d34d83337d9f56b6be85e2ed85ebd9d12667625eeaf5893415a
```

**Verification:**
```bash
curl -s "https://api.whatsonchain.com/v1/bsv/main/tx/hash/${txid}" | jq .
```

**Idempotency Guarantee:**
- If the same payload (same SHA-256 hash) is published multiple times, the **same TXID** is returned.
- The publisher service caches TXIDs in PostgreSQL to prevent duplicate blockchain transactions.

---

### `publisher` Object

Metadata about the blockchain publishing operation.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `network` | string | Yes | Blockchain network ("mainnet" or "testnet") |
| `status` | string | Yes | Transaction status ("broadcasted", "confirmed", "failed") |
| `cached` | boolean | Yes | Whether txid was retrieved from cache (idempotent publish) |

**Status Values:**
- `broadcasted` - Transaction sent to BSV network, awaiting mining
- `confirmed` - Transaction included in a block (>=1 confirmation)
- `failed` - Transaction broadcast failed

**Cached Field Semantics (M2):**
- `cached: false` - New publish record created; transaction broadcasted to blockchain (or stub txid generated in test mode)
- `cached: true` - SHA-256 already existed in publisher database; txid returned from storage without re-publishing

**Critical:** `cached: true` guarantees no duplicate blockchain transaction was created. This prevents double-spending satoshis on the same hash.

**Example (first publish):**
```json
{
  "network": "mainnet",
  "status": "broadcasted",
  "cached": false
}
```

**Example (idempotent republish):**
```json
{
  "network": "mainnet",
  "status": "broadcasted",
  "cached": true
}
```

**Note:** Current M1 implementation returns `status: "broadcasted"`. Future versions may enrich this with:
- `confirmations` (integer) - Number of block confirmations
- `blockheight` (integer) - Block height where tx was mined
- `blockhash` (string) - Block hash containing the transaction

---

### `meta` Object

Processing metadata for traceability and correlation.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `receivedAt` | string | Yes | ISO 8601 timestamp when server received the message |
| `sourceId` | string | No | Identifier for message source (future use) |
| `correlationId` | string | No | Client-provided correlation ID (future use) |
| `messageId` | string | No | Unique message identifier (future use) |
| `schema` | string | No | Schema version for original payload (future use) |

**Example:**
```json
{
  "sourceId": null,
  "receivedAt": "2026-01-29T03:27:04.714Z",
  "correlationId": null,
  "messageId": null,
  "schema": null
}
```

**Timestamp Convention:**
- `meta.receivedAt` = Server processing time (UTC, ISO 8601)
- `original.ts` (if present) = Device-provided timestamp

**Difference:** `receivedAt` may differ from `original.ts` due to:
- Network latency
- Clock skew between device and server
- Offline buffering (device stores messages and sends later)

---

## Verification Workflow

### 1. Verify SHA-256 Hash

```bash
# Extract canonical JSON and compute hash
CANONICAL='{"deviceId":"AKUA-TEST-001","tempC":22.4,"ts":"2026-01-28T00:00:00Z"}'
echo -n "$CANONICAL" | sha256sum
# Should match receipt.sha256
```

### 2. Verify Transaction Exists

```bash
TXID="8ae3c7cc76bf6d34d83337d9f56b6be85e2ed85ebd9d12667625eeaf5893415a"
curl -s "https://api.whatsonchain.com/v1/bsv/main/tx/hash/${TXID}" | jq .
```

### 3. Verify OP_RETURN Payload

```bash
curl -s "https://api.whatsonchain.com/v1/bsv/main/tx/hash/${TXID}" \
  | jq '.vout[] | select(.scriptPubKey.type=="nulldata") | .scriptPubKey.hex'

# Expected format: 6a04414b5541 + 20 + <sha256 hash>
# 6a = OP_RETURN
# 04414b5541 = PUSHDATA 4 bytes "AKUA"
# 20 = PUSHDATA 32 bytes
# <hash> = SHA-256 hash from receipt
```

### 4. Check Confirmations (Optional)

```bash
curl -s "https://api.whatsonchain.com/v1/bsv/main/tx/hash/${TXID}" \
  | jq '{confirmations, blockhash, blockheight}'
```

---

## Schema Evolution

Future versions may add:

### Version 2 (Planned)
- `publisher.confirmations` - Block confirmations
- `publisher.blockheight` - Mined block height
- `publisher.fee` - Transaction fee in satoshis
- `meta.geotag` - GPS coordinates for geospatial anchoring
- `meta.deviceType` - Device classification

### Backward Compatibility
- New fields will be **additive** (existing fields won't change meaning)
- `version` field allows parsers to handle schema changes
- Clients should ignore unknown fields

---

## Error Handling

If processing fails, no receipt is published to `iot.payload.out`. Instead:

1. **Transient errors** (publisher timeout, network issues):
   - Message is **retried** up to 5 times (configurable via `MAX_ATTEMPTS`)
   - Exponential backoff between retries

2. **Permanent errors** (invalid JSON, publisher rejects hash):
   - Message is routed to **dead letter queue** (`iot.payload.in.dlq`)
   - DLQ messages include error metadata in headers

3. **Monitoring:**
   - Check DLQ depth: `curl -u akua:akua_pass http://localhost:15672/api/queues/%2F/iot.payload.in.dlq`

---

## Integration Example

### Node.js Consumer

```javascript
const amqp = require('amqplib');

async function consumeReceipts() {
  const conn = await amqp.connect('amqp://akua:akua_pass@localhost:5672');
  const channel = await conn.createChannel();
  
  await channel.assertQueue('iot.payload.out', { durable: true });
  
  channel.consume('iot.payload.out', (msg) => {
    if (!msg) return;
    
    const receipt = JSON.parse(msg.content.toString());
    
    console.log('Received receipt:');
    console.log('  Device:', receipt.original.deviceId);
    console.log('  SHA-256:', receipt.sha256);
    console.log('  TXID:', receipt.txid);
    console.log('  Network:', receipt.publisher.network);
    console.log('  Verify:', `https://whatsonchain.com/tx/${receipt.txid}`);
    
    channel.ack(msg);
  });
}

consumeReceipts().catch(console.error);
```

---

## Security Considerations

### Safe to Share
✅ `sha256` - Public hash
✅ `txid` - Public blockchain transaction
✅ `original` - IoT sensor data (if non-sensitive)
✅ `publisher.network` - Public info

### Never Share
❌ BSV private keys (not in receipt)
❌ Database credentials (not in receipt)
❌ Internal service URLs (not in receipt)

### Privacy Notes
- `original` field contains **full IoT payload** - ensure no PII (personally identifiable information) is included by IoT devices
- All receipts on `iot.payload.out` are **unencrypted** - use TLS for RabbitMQ connections
- Blockchain transactions are **public and permanent** - only hashes are published, not raw data

---

## FAQ

**Q: Can I verify the hash myself?**  
A: Yes! Use the `canonical` field to recompute the SHA-256 and compare with `sha256`.

**Q: What if I publish the same payload twice?**  
A: The same `txid` is returned (idempotent). Only one blockchain transaction is created.

**Q: How do I check if a transaction is confirmed?**  
A: Query WhatsOnChain: `curl https://api.whatsonchain.com/v1/bsv/main/tx/hash/{txid} | jq .confirmations`

**Q: Can I parse receipts without knowing the original payload schema?**  
A: Yes! The receipt schema is fixed (version 1). The `original` field is opaque - treat it as arbitrary JSON.

**Q: What if `publisher.status` is "failed"?**  
A: Currently not implemented in M1. Failed publishes route to DLQ without producing a receipt.

---

## Related Documentation

- [DEPLOYMENT.md](DEPLOYMENT.md) - Deployment guide
- [STATUS.md](STATUS.md) - M1 acceptance test evidence
- [tech.md](tech.md) - Technical specifications
- [WhatsOnChain API](https://developers.whatsonchain.com/) - Blockchain verification

---

**Schema Version:** 1.0  
**Last Updated:** 2026-01-29  
**Status:** Production (M1 Complete)
