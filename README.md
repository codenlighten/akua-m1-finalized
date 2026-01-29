# AKUA Blockchain Integration Project

**Client:** AKUA INC.  
**Vendor:** SmartLedger Blockchain Solutions Inc.  
**Project:** JSON Hashing & Blockchain Publishing Integration  
**Current Milestone:** M1 - Container MVP

---

## Project Overview

This project delivers a scalable blockchain integration solution for AKUA's IoT logistics infrastructure, providing:

- **Tamper-evident data logging** via SHA-256 hashing
- **Blockchain publishing** for immutable audit trails
- **RabbitMQ-based architecture** for reliable message processing
- **Docker containerized deployment** for easy scaling

---

## Repository Structure

```
akua-finalized-m1/
├── docker-compose.yml      # Full stack deployment
├── DEPLOYMENT.md           # Deployment guide
├── STATUS.md              # Project status tracker
├── tech.md                # Technical specifications
├── AKUA_SOW.md           # Statement of Work
├── AKUA_GANT.md          # Project timeline
├── AUDIT_SCRIPT.sh       # Server audit script
│
├── hashsvc/              # Hash+Envelope Service
│   ├── Dockerfile
│   ├── package.json
│   └── src/
│       ├── index.js            # Main application
│       ├── rabbitmq.js         # RabbitMQ consumer/publisher
│       ├── canonicalize.js     # Deterministic JSON hashing
│       └── publisher-client.js # Publisher HTTP client
│
└── publisher/            # Blockchain Publisher Service
    ├── Dockerfile
    ├── package.json
    └── src/
        ├── index.js        # Express API server
        ├── db.js          # PostgreSQL connection & queries
        └── blockchain.js  # Blockchain publishing logic
```

---

## Quick Start

### Prerequisites

- Docker & Docker Compose installed
- Access to deployment server (143.198.43.229)
- RabbitMQ available (provided in docker-compose.yml)

### Local Development

```bash
# Install dependencies for hashsvc
cd hashsvc
npm install

# Install dependencies for publisher
cd ../publisher
npm install

# Start local development (requires RabbitMQ and Postgres)
npm run dev
```

### Server Deployment

1. **Run audit on server:**
   ```bash
   ssh root@143.198.43.229
   bash < AUDIT_SCRIPT.sh
   ```

2. **Deploy the stack:**
   ```bash
   # Copy files to server
   scp -r . root@143.198.43.229:/opt/akua-stack/
   
   # SSH to server
   ssh root@143.198.43.229
   cd /opt/akua-stack
   
   # Start services
   docker compose up -d --build
   
   # Check status
   docker compose ps
   docker compose logs -f
   ```

3. **Verify deployment:**
   ```bash
   # Health checks
   curl http://localhost:8080/healthz  # hashsvc
   curl http://localhost:8081/healthz  # publisher
   
   # RabbitMQ Management UI
   # Open: http://143.198.43.229:15672
   # User: akua, Pass: akua_pass
   ```

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed instructions.

---

## Architecture

```
┌─────────────────┐      ┌──────────────────┐      ┌─────────────────┐
│   IoT Devices   │─────>│    RabbitMQ      │<────>│  Hash Service   │
│   (Sensors)     │      │  iot.payload.in  │      │  (hashsvc)      │
└─────────────────┘      │  iot.payload.out │      └────────┬────────┘
                         └──────────────────┘               │
                                                            │ HTTP
                                                            ▼
                         ┌──────────────────┐      ┌─────────────────┐
                         │   PostgreSQL     │<─────│  Publisher      │
                         │  (audit log)     │      │  Service        │
                         └──────────────────┘      └────────┬────────┘
                                                            │
                                                            ▼
                                                   ┌─────────────────┐
                                                   │  SmartLedger    │
                                                   │  Blockchain     │
                                                   └─────────────────┘
```

### Message Flow

1. IoT device publishes JSON payload to `iot.payload.in` queue
2. Hash Service consumes message and:
   - Canonicalizes JSON (deterministic key ordering)
   - Computes SHA-256 hash
   - Calls Publisher Service with hash
3. Publisher Service:
   - Checks for existing record (idempotency)
   - Publishes hash to blockchain
   - Returns transaction ID (txid)
4. Hash Service creates receipt with `{original, sha256, txid}`
5. Receipt published to `iot.payload.out` queue

---

## Services

### Hash+Envelope Service (hashsvc)

**Purpose:** Consume IoT payloads, hash them, publish to blockchain, return receipts

**Key Features:**
- Deterministic JSON canonicalization
- SHA-256 hashing
- Retry logic with exponential backoff
- Dead letter queue for failed messages
- Health checks and metrics

**Environment Variables:**
- `RABBIT_URL` - RabbitMQ connection string
- `IN_QUEUE` - Input queue name
- `OUT_QUEUE` - Output queue name
- `PUBLISHER_URL` - Publisher service URL
- `MAX_ATTEMPTS` - Max retry attempts (default: 5)

### Publisher Service

**Purpose:** Publish hashes to blockchain with idempotency guarantees

**Key Features:**
- PostgreSQL-backed idempotency
- Transaction ID tracking
- Network selection (testnet/mainnet)
- RESTful API
- Audit logging

**Environment Variables:**
- `DATABASE_URL` - PostgreSQL connection string
- `NETWORK` - Blockchain network (testnet/mainnet)
- `BLOCKCHAIN_PUBLISH_URL` - External blockchain API
- `PUBLISH_API_KEY` - API key for blockchain service

**API Endpoints:**
- `POST /publish` - Publish a hash
- `GET /publish/:sha256` - Get publish record
- `GET /healthz` - Health check
- `GET /metrics` - Service metrics

---

## M1 Acceptance Testing

### Test 1: Basic Flow

```bash
# Publish test message to RabbitMQ
docker exec rabbitmq rabbitmqadmin publish \
  exchange=amq.default \
  routing_key=iot.payload.in \
  payload='{"b":2,"a":1}'

# Check receipt on output queue
docker exec rabbitmq rabbitmqadmin get \
  queue=iot.payload.out \
  ackmode=ack_requeue_false
```

**Expected Receipt:**
```json
{
  "version": "1",
  "original": {"b":2,"a":1},
  "canonical": "{\"a\":1,\"b\":2}",
  "sha256": "96a29be8b7bfed86....",
  "txid": "mock_tx_1738105829101_abc123",
  "publisher": {
    "network": "testnet",
    "status": "broadcasted"
  },
  "meta": {
    "receivedAt": "2026-01-28T...",
    "correlationId": null,
    "messageId": null,
    "sourceId": null,
    "schema": null
  }
}
```

### Test 2: Idempotency

Publish the same payload twice and verify the same `txid` is returned.

### Test 3: Error Handling

Publish invalid JSON and verify it routes to the DLQ.

See [DEPLOYMENT.md](DEPLOYMENT.md) for complete testing procedures.

---

## Development

### Running Tests

```bash
# TODO: Add test suite (M2 milestone)
npm test
```

### Code Style

- ES6+ JavaScript
- 2-space indentation
- Async/await preferred over callbacks
- Comprehensive error handling
- Structured logging with Pino

---

## Monitoring

### Logs

```bash
# View all logs
docker compose logs -f

# Filter by service
docker compose logs -f hashsvc
docker compose logs -f publisher
```

### Metrics

- `GET http://localhost:8080/metrics` - hashsvc metrics
- `GET http://localhost:8081/metrics` - publisher metrics

### RabbitMQ Management

- URL: `http://143.198.43.229:15672`
- Username: `akua`
- Password: `akua_pass`

---

## Project Milestones

- **M1 (Jan-Feb 2026):** ✅ Container MVP - Hash+Publish+RabbitMQ
- **M2 (March 2026):** 🔲 Simulation, Integration & Testing
- **M3 (April 2026):** 🔲 Deployment to AKUA Infrastructure
- **M4 (May 2026):** 🔲 Training & Documentation
- **M5 (May 2026):** 🔲 Customer Demo/Presentation

See [STATUS.md](STATUS.md) for current progress.

---

## Documentation

- [tech.md](tech.md) - Technical specifications & interface contracts
- [AKUA_SOW.md](AKUA_SOW.md) - Statement of Work
- [AKUA_GANT.md](AKUA_GANT.md) - Project Gantt chart
- [DEPLOYMENT.md](DEPLOYMENT.md) - Deployment procedures
- [STATUS.md](STATUS.md) - Current status & checklist

---

## Support

**SmartLedger Blockchain Solutions Inc.**  
251 Little Falls Dr.  
Wilmington, DE 19808-1674

**Technical Contact:**  
Email: support@smartledger.solutions  
CAGE: 10HF4  
UEI: C5RUDT3WS844

---

## License

PROPRIETARY - SmartLedger Blockchain Solutions Inc.  
All rights reserved.
