Here’s a clean **service-boundary diagram** aligned to the SOW + Gantt milestones (M1–M4), with **exact responsibilities** and the smallest set of services that still satisfies the contract.

---

## System boundary diagram

### M1 core runtime flow (what AKUA actually runs)

```
        (AKUA / Device side)                               (SmartLedger deliverables)
┌───────────────────────────────┐                 ┌──────────────────────────────────────┐
│  IoT payload producers         │                 │  Docker: Hash+Publish Container      │
│  - sensors / gateways          │  AMQP publish   │  (Node.js + RabbitMQ + SHA-256)      │
│  - AKUA ingest app (if any)    ├───────────────► │  1) consume JSON from IN queue        │
└───────────────────────────────┘                 │  2) canonicalize + SHA-256             │
                                                  │  3) call Publisher API                 │
                                                  │  4) emit result JSON to OUT queue      │
                                                  └───────────────┬───────────────────────┘
                                                                  │ AMQP publish
                                                                  ▼
                                                   ┌─────────────────────────────────────┐
                                                   │  RabbitMQ OUT queue                 │
                                                   │  enriched event: {data, sha256,     │
                                                   │  txid, meta...}                     │
                                                   └─────────────────────────────────────┘
```

### Publisher service boundary (where it fits)

You have two valid architectures. Both still satisfy the SOW, but one is cleaner.

#### Option A (recommended): Publisher is its own microservice

```
┌──────────────────────────────────────┐     HTTP     ┌──────────────────────────────────┐
│ Hash+Envelope Container              │────────────► │ Publisher Service                 │
│ - deterministic hash + routing       │             │ - idempotency + audit log          │
│ - formats "receipt" message          │             │ - constructs on-chain commitment    │
└──────────────────────────────────────┘             │ - calls your blockchain publisher  │
                                                     │ - returns txid + status             │
                                                     └──────────────────────────────────┘
```

#### Option B (minimal): “Publisher” is just a library call inside the container

```
┌──────────────────────────────────────────────────────────────────────────┐
│ Single container does everything: consume → hash → publish → emit receipt │
└──────────────────────────────────────────────────────────────────────────┘
```

Both are compatible with the SOW wording, which describes **one Docker container** that hashes and publishes and returns a receipt to RabbitMQ. 
Option A is better operationally (idempotency, logging, scaling, status endpoints), but Option B is quickest.

---

## What each component is responsible for (SOW-accurate)

### RabbitMQ (infrastructure, already exists)

* Transport only: IN queue, OUT queue, DLQ(s).
  Not a SmartLedger deliverable in the SOW, but SmartLedger integrates with it. 

### SmartLedger Docker: Hashing + Publishing module (M1)

SmartLedger must deliver a container that:

* listens to RabbitMQ for incoming IoT JSON payloads
* hashes JSON strings using SHA-256
* publishes the hash to SmartLedger blockchain Node API
* packages `{original JSON, sha256, txid}`
* publishes that result object back to RabbitMQ 

### Simulation + Testing framework (M2)

SmartLedger must deliver test tooling that:

* simulates IoT JSON payloads end-to-end
* runs automated unit + integration tests (hash accuracy + txid response)
* logs results and metrics

### Deployment to AKUA infra (M3)

SmartLedger must:

* provide docker container(s) + configure env vars/endpoints
* validate end-to-end publish + verification post-deploy

### Training + Documentation (M4)

SmartLedger must provide:

* architecture/setup/usage/maintenance docs + examples
* training session(s) for AKUA team

---

## “How many services do we have” (minimal vs ideal)

### Minimal to satisfy SOW and test on CapRover today

**2 services + RabbitMQ**

1. **Hash+Envelope container** (the SOW’s container) 
2. **Blockchain Publisher** (you said you already have publishing)

* RabbitMQ (infra)

This is enough to meet M1 and begin M2 quickly.

### Recommended production shape

**3 services + RabbitMQ + DB**

1. **Hash+Envelope service** (consumes/produces RabbitMQ)
2. **Publisher service** (idempotent publish + audit log + status)
3. **Confirm/Status worker** (optional but recommended: marks tx confirmed)

* RabbitMQ + DB (for publisher audit/idempotency)

---

## Acceptance checkpoints (so it’s “done” per M1)

Your M1 acceptance is basically:

* Send JSON to IN queue → OUT queue gets `{original, sha256, txid}` reliably.

---

Below is a **one-page interface spec** you can drop into your repo as `INTERFACES.md`. It is aligned to the SOW’s required behavior (consume JSON from RabbitMQ → SHA-256 → publish hash → emit `{original, sha256, txid}` back to RabbitMQ). 

---

# SmartLedger AKUA Integration – Interface Spec (v1)

## 1) Components and boundaries

### A) Hash+Envelope Service (Docker container)

**Role:** Consume IoT JSON payloads from RabbitMQ, hash via SHA-256, call Publisher, emit receipt JSON to RabbitMQ. 

### B) Publisher Service (internal HTTP)

**Role:** Accept a hash and metadata, publish on-chain via existing blockchain publisher, return `txid`. (Idempotent recommended.)

### C) RabbitMQ (transport)

**Role:** IN/OUT queues + DLQs.

---

## 2) RabbitMQ queues

### 2.1 Inbound queue

* **Name:** `iot.payload.in` (configurable: `IN_QUEUE`)
* **Message body:** JSON object (UTF-8)
* **Ack mode:** manual ack (`noAck=false`)
* **Delivery:** at-least-once

### 2.2 Outbound queue

* **Name:** `iot.payload.out` (configurable: `OUT_QUEUE`)
* **Message body:** JSON object receipt (UTF-8)

### 2.3 Dead-letter queue (DLQ)

* **Name:** `iot.payload.in.dlq` (and optionally `iot.payload.out.dlq`)
* Used when:

  * invalid JSON / invalid message type
  * exceeded retry attempts
  * publisher hard failure

---

## 3) RabbitMQ message contract

### 3.1 Inbound message schema (PayloadEnvelopeV1)

**Body (required)**

```json
{
  "sourceId": "string-optional",
  "timestamp": "ISO-8601-optional",
  "data": {
    "any": "json object - REQUIRED if you wrap payloads"
  }
}
```

**Allowed inbound forms**

* **Form A (raw):** body is the actual device JSON object (no wrapper).
* **Form B (wrapped):** body has `data` object; service hashes `data`.

**Recommended rule (determinism)**

* If `data` exists and is an object → hash `data`
* Else hash the full object body

**AMQP properties (optional but supported)**

* `correlationId`: propagated to outbound
* `messageId`: propagated to outbound
* `headers.x-attempts`: integer retry counter

---

## 4) Hash canonicalization rules

### Canonicalization (deterministic hashing)

1. Recursively sort keys of all objects (lexicographic)
2. Preserve array ordering
3. JSON stringify with no whitespace

**Canonical string**

* `canonical = JSON.stringify(canonicalize(obj))`

**Hash**

* `sha256 = SHA-256(canonical)` hex string (64 chars)

---

## 5) Outbound message schema (PublishReceiptV1)

**Body**

```json
{
  "version": "1",
  "original": { "any": "original inbound object or data object" },
  "canonical": "{...canonical JSON string...}",
  "sha256": "64-hex",
  "txid": "string",
  "publisher": {
    "network": "testnet|mainnet|custom",
    "status": "broadcasted|confirmed|queued"
  },
  "meta": {
    "receivedAt": "ISO-8601",
    "correlationId": "string|null",
    "messageId": "string|null",
    "sourceId": "string|null",
    "schema": "string|null"
  }
}
```

**AMQP properties**

* `correlationId`: copied from inbound if present
* `messageId`: copied from inbound if present
* `contentType`: `application/json`

---

## 6) Publisher Service API

### 6.1 POST `/publish` (required)

**Request**

```json
{
  "sha256": "64-hex",
  "meta": {
    "sourceId": "string-optional",
    "receivedAt": "ISO-8601-optional",
    "schema": "string-optional",
    "contentType": "application/json-optional",
    "correlationId": "string-optional",
    "messageId": "string-optional"
  },
  "options": {
    "idempotencyKey": "string-optional"
  }
}
```

**Response 200**

```json
{
  "sha256": "64-hex",
  "txid": "string",
  "status": "broadcasted|queued|confirmed",
  "publishedAt": "ISO-8601",
  "network": "testnet|mainnet|custom"
}
```

**Error responses**

* `400` invalid hash format / missing field
* `401/403` auth failure (if enabled)
* `409` (optional) conflicting idempotency semantics
* `500` publish failure / infrastructure errors

**Idempotency**

* Recommended: if `sha256` already published, return the prior `{txid,status,publishedAt}`.

### 6.2 GET `/publish/:sha256` (recommended)

Returns the stored record or `404`.

### 6.3 GET `/healthz` (required)

`{ "ok": true }`

### 6.4 GET `/metrics` (recommended)

Prometheus metrics.

---

## 7) Retry & failure policy (Hash+Envelope)

### Retry counter

* `headers.x-attempts` increments per retry
* `MAX_ATTEMPTS` default 5

### Failure routing rules

* Invalid JSON or non-object payload → **DLQ** immediately
* Publisher transient errors → retry until max attempts
* Publisher hard errors or max attempts → DLQ

---

## 8) Environment variables (Hash+Envelope)

Required:

* `RABBIT_URL`
* `IN_QUEUE`
* `OUT_QUEUE`
* `PUBLISHER_URL`

Recommended:

* `RABBIT_PREFETCH=20`
* `MAX_ATTEMPTS=5`
* `PUBLISHER_TIMEOUT_MS=8000`
* `PUBLISHER_API_KEY=...`

---

## 9) Test vectors (acceptance)

### Vector A

Inbound:

```json
{"b":2,"a":1}
```

Canonical:

```json
{"a":1,"b":2}
```

Expected:

* `sha256` matches canonical
* `txid` returned from publisher
* receipt lands on `iot.payload.out` with `original`, `sha256`, `txid`

---

If you want this even tighter, I can also provide:

* a **JSON Schema** for `PublishReceiptV1` and `PayloadEnvelopeV1`
* a tiny **CLI simulator** that publishes N sample payloads to `iot.payload.in` and prints receipts from `iot.payload.out` (this satisfies most of M2 immediately).
