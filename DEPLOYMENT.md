# AKUA Blockchain Integration - Deployment Guide

**Target Server:** 143.198.43.229 (harvest-db)  
**Deployment Strategy:** Docker Compose  
**Milestone:** M1 - JSON Hashing & Publishing Container MVP

---

## Pre-Deployment: System Audit

SSH into the droplet and run the audit script:

```bash
# OS + resources
uname -a
lsb_release -a || cat /etc/os-release
free -h
df -h

# Docker
docker --version || echo "docker missing"
docker compose version || docker-compose --version || echo "compose missing"

# Ports already in use
sudo ss -tulpn | head -n 50

# Firewall status
sudo ufw status || true
```

**Expected Results:**
- Ubuntu 24.04.3 LTS confirmed ✓
- Memory: ~27% used (adequate)
- Disk: ~11.5% of 23.17GB used (plenty of space)
- Docker: Check if installed
- Compose: Check if installed

---

## Step 1: Docker Installation (if needed)

If Docker is not installed, run:

```bash
# Update system
sudo apt-get update -y
sudo apt-get install -y ca-certificates curl gnupg

# Add Docker's official GPG key
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | \
  sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# Add Docker repository
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo $VERSION_CODENAME) stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker Engine
sudo apt-get update -y
sudo apt-get install -y docker-ce docker-ce-cli containerd.io \
  docker-buildx-plugin docker-compose-plugin

# Allow non-root Docker access (optional)
sudo usermod -aG docker $USER
newgrp docker

# Verify installation
docker --version
docker compose version
```

---

## Step 2: System Restart (if required)

The login message indicated a system restart is required. Apply it now:

```bash
sudo reboot
```

Wait 2-3 minutes, then reconnect:

```bash
ssh root@143.198.43.229
```

---

## Step 3: Create Directory Structure

```bash
# Create deployment directory
sudo mkdir -p /opt/akua-stack/{hashsvc,publisher}
cd /opt/akua-stack

# Verify structure
tree -L 2 /opt/akua-stack || ls -la /opt/akua-stack
```

**Expected structure:**
```
/opt/akua-stack/
├── docker-compose.yml
├── hashsvc/
│   ├── Dockerfile
│   ├── package.json
│   └── src/
└── publisher/
    ├── Dockerfile
    ├── package.json
    └── src/
```

---

## Step 4: Deploy .env File

Create `/opt/akua-stack/.env` with your BSV credentials:

```bash
cat > /opt/akua-stack/.env << 'EOF'
BSV_ADDRESS=YOUR_BSV_ADDRESS_HERE
BSV_PRIVATE_KEY=YOUR_PRIVATE_KEY_WIF_HERE
BSV_NETWORK=mainnet
EOF

# Secure the .env file
chmod 600 /opt/akua-stack/.env
```

⚠️ **Security Note:** Never commit the `.env` file to git. It contains your private key!

---

## Step 5: Deploy docker-compose.yml

Create `/opt/akua-stack/docker-compose.yml`:

```bash
cat > /opt/akua-stack/docker-compose.yml << 'EOF'
services:
  rabbitmq:
    image: rabbitmq:3.13-management
    hostname: rabbitmq
    ports:
      - "5672:5672"      # AMQP
      - "15672:15672"    # Management UI
    environment:
      RABBITMQ_DEFAULT_USER: akua
      RABBITMQ_DEFAULT_PASS: akua_pass
    volumes:
      - rabbitmq_data:/var/lib/rabbitmq
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "rabbitmq-diagnostics", "ping"]
      interval: 30s
      timeout: 10s
      retries: 3

  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: publisher
      POSTGRES_USER: publisher
      POSTGRES_PASSWORD: publisher_pass
    volumes:
      - pg_data:/var/lib/postgresql/data
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U publisher"]
      interval: 10s
      timeout: 5s
      retries: 5

  publisher:
    build:
      context: ./publisher
    environment:
      PORT: 8080
      DATABASE_URL: postgres://publisher:publisher_pass@postgres:5432/publisher
      NETWORK: testnet
      # TODO: Wire to your existing blockchain publishing layer
      # BLOCKCHAIN_PUBLISH_URL: http://your-existing-publisher:8080/publish
      # PUBLISH_API_KEY: "your-api-key"
    depends_on:
      postgres:
        condition: service_healthy
    ports:
      - "8081:8080"
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/healthz"]
      interval: 30s
      timeout: 10s
      retries: 3

  hashsvc:
    build:
      context: ./hashsvc
    environment:
      PORT: 8080
      RABBIT_URL: amqp://akua:akua_pass@rabbitmq:5672
      IN_QUEUE: iot.payload.in
      OUT_QUEUE: iot.payload.out
      MAX_ATTEMPTS: 5
      PUBLISHER_URL: http://publisher:8080/publish
      PUBLISHER_TIMEOUT_MS: 8000
      LOG_LEVEL: info
    depends_on:
      rabbitmq:
        condition: service_healthy
      publisher:
        condition: service_healthy
    ports:
      - "8080:8080"
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/healthz"]
      interval: 30s
      timeout: 10s
      retries: 3

volumes:
  rabbitmq_data:
  pg_data:
EOF
```

---

## Step 6: Start the Stack

```bash
cd /opt/akua-stack

# Start all services
docker compose up -d --build

# Check status
docker compose ps

# View logs
docker compose logs -f
```

**Expected output:**
```
NAME                 IMAGE                      STATUS
rabbitmq             rabbitmq:3.13-management   Up (healthy)
postgres             postgres:16-alpine         Up (healthy)
publisher            akua-stack-publisher       Up (healthy)
hashsvc              akua-stack-hashsvc         Up (healthy)
```

---

## Step 7: Verify Services

### RabbitMQ Management UI

Open browser: `http://143.198.43.229:15672`

- Username: `akua`
- Password: `akua_pass`

Create queues:
1. Navigate to "Queues" tab
2. Create queue: `iot.payload.in`
3. Create queue: `iot.payload.out`
4. Create queue: `iot.payload.in.dlq` (with appropriate DLQ settings)

### Health Checks

```bash
# hashsvc
curl http://localhost:8080/healthz
# Expected: {"ok":true}

# publisher
curl http://localhost:8081/healthz
# Expected: {"ok":true}
```

---

## Step 8: M1 Acceptance Test

### Test 1: Basic Flow

Using RabbitMQ Management UI:

1. Go to "Queues" → `iot.payload.in`
2. Click "Publish message"
3. Payload:
   ```json
   {"b":2,"a":1}
   ```
4. Click "Publish message"
5. Check `iot.payload.out` for receipt

**Expected receipt:**
```json
{
  "version": "1",
  "original": {"b":2,"a":1},
  "canonical": "{\"a\":1,\"b\":2}",
  "sha256": "64-character-hex-hash",
  "txid": "blockchain-transaction-id",
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

### Test 2: Via CLI (alternative)

```bash
# Publish test message
docker exec rabbitmq rabbitmqadmin publish \
  exchange=amq.default \
  routing_key=iot.payload.in \
  payload='{"b":2,"a":1}'

# Consume receipt
docker exec rabbitmq rabbitmqadmin get \
  queue=iot.payload.out \
  ackmode=ack_requeue_false
```

---

## Step 9: Monitor & Debug

### View Logs

```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f hashsvc
docker compose logs -f publisher
docker compose logs -f rabbitmq
```

### Check Resource Usage

```bash
docker stats
```

### Restart Individual Service

```bash
docker compose restart hashsvc
docker compose restart publisher
```

---

## Firewall Configuration (Production)

```bash
# Allow SSH
sudo ufw allow 22/tcp

# Allow RabbitMQ (if external access needed)
sudo ufw allow 15672/tcp comment 'RabbitMQ Management'

# Enable firewall
sudo ufw enable
sudo ufw status
```

**Note:** For M1/M2 testing, leave firewall permissive. Lock down for M3 production.

---

## Troubleshooting

### Container won't start

```bash
# Check logs
docker compose logs [service-name]

# Rebuild
docker compose down
docker compose up -d --build --force-recreate
```

### RabbitMQ connection refused

```bash
# Check if RabbitMQ is ready
docker exec rabbitmq rabbitmq-diagnostics ping

# Restart RabbitMQ
docker compose restart rabbitmq
```

### Publisher not returning txid

```bash
# Check publisher logs
docker compose logs publisher

# Test publisher directly
curl -X POST http://localhost:8081/publish \
  -H "Content-Type: application/json" \
  -d '{"sha256":"0123456789abcdef...", "meta":{}}'
```

---

## Cleanup Commands

```bash
# Stop all services
docker compose down

# Stop and remove volumes (DESTRUCTIVE)
docker compose down -v

# Remove all images
docker compose down --rmi all
```

---

## Next Steps (M2)

1. Create automated test suite
2. Generate simulation payloads (100-1000 messages)
3. Run load tests
4. Measure performance (throughput, latency)
5. Tune `RABBIT_PREFETCH`, connection pools
6. Document results in STATUS.md

---

## Production Deployment (M3)

Consider migrating to:
- **CapRover** for easier management
- **Separate servers** for RabbitMQ, DB, services
- **Load balancer** for multiple hashsvc instances
- **Monitoring** (Prometheus + Grafana)
- **Backup strategy** for PostgreSQL
- **TLS** for all connections
- **Secrets management** (not ENV vars)
