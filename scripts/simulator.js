#!/usr/bin/env node
/**
 * AKUA M2 Load Testing Simulator
 * 
 * Publishes synthetic IoT messages to RabbitMQ and collects performance metrics.
 * 
 * Usage:
 *   node scripts/simulator.js --count 100 --rate 10 --duplicate 0.1
 * 
 * Options:
 *   --count <n>       Number of messages to send (default: 10)
 *   --rate <n>        Messages per second (default: 1)
 *   --duplicate <p>   Probability of duplicate message (0-1, default: 0)
 *   --report          Output detailed latency report
 */

const RABBIT_HTTP = process.env.RABBIT_HTTP || 'http://localhost:15672';
const RABBIT_USER = process.env.RABBIT_USER || 'akua';
const RABBIT_PASS = process.env.RABBIT_PASS || 'akua_pass';
const VHOST = encodeURIComponent(process.env.RABBIT_VHOST || '/');
const IN_QUEUE = process.env.IN_QUEUE || 'iot.payload.in';
const OUT_QUEUE = process.env.OUT_QUEUE || 'iot.payload.out';

function parseArgs() {
  const args = process.argv.slice(2);
  const config = {
    count: 10,
    rate: 1,
    duplicate: 0,
    report: false
  };

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--count') config.count = parseInt(args[++i], 10);
    else if (args[i] === '--rate') config.rate = parseFloat(args[++i]);
    else if (args[i] === '--duplicate') config.duplicate = parseFloat(args[++i]);
    else if (args[i] === '--report') config.report = true;
  }

  return config;
}

function basicAuthHeader(user, pass) {
  return `Basic ${Buffer.from(`${user}:${pass}`).toString('base64')}`;
}

function generatePayload(index, duplicate = false) {
  const deviceIds = ['AKUA-SIM-001', 'AKUA-SIM-002', 'AKUA-SIM-003', 'AKUA-SIM-004'];
  const deviceId = deviceIds[index % deviceIds.length];
  
  return {
    deviceId,
    tempC: 15 + Math.random() * 20,
    humidity: 40 + Math.random() * 40,
    pressure: 980 + Math.random() * 60,
    ts: new Date().toISOString(),
    seqNum: duplicate ? index - 1 : index
  };
}

async function publishMessage(payload) {
  const url = `${RABBIT_HTTP}/api/exchanges/${VHOST}/amq.default/publish`;
  const body = {
    properties: { delivery_mode: 2 },
    routing_key: IN_QUEUE,
    payload: JSON.stringify(payload),
    payload_encoding: 'string'
  };

  const startTime = Date.now();
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      authorization: basicAuthHeader(RABBIT_USER, RABBIT_PASS),
      'content-type': 'application/json'
    },
    body: JSON.stringify(body)
  });

  const elapsed = Date.now() - startTime;
  const json = await res.json();
  
  return { routed: json.routed, elapsed };
}

async function getQueueDepth(queue) {
  const url = `${RABBIT_HTTP}/api/queues/${VHOST}/${queue}`;
  const res = await fetch(url, {
    headers: {
      authorization: basicAuthHeader(RABBIT_USER, RABBIT_PASS)
    }
  });
  
  const data = await res.json();
  return data.messages || 0;
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function calculateStats(values) {
  if (values.length === 0) return { min: 0, max: 0, avg: 0, p50: 0, p95: 0, p99: 0 };
  
  const sorted = values.slice().sort((a, b) => a - b);
  const sum = sorted.reduce((a, b) => a + b, 0);
  
  return {
    min: sorted[0],
    max: sorted[sorted.length - 1],
    avg: sum / sorted.length,
    p50: sorted[Math.floor(sorted.length * 0.50)],
    p95: sorted[Math.floor(sorted.length * 0.95)],
    p99: sorted[Math.floor(sorted.length * 0.99)]
  };
}

async function main() {
  const config = parseArgs();
  
  console.log('=== AKUA M2 Load Testing Simulator ===');
  console.log(`Messages: ${config.count}`);
  console.log(`Rate: ${config.rate} msgs/sec`);
  console.log(`Duplicate probability: ${(config.duplicate * 100).toFixed(1)}%`);
  console.log(`Target: ${RABBIT_HTTP}`);
  console.log();

  const intervalMs = 1000 / config.rate;
  const metrics = {
    sent: 0,
    routed: 0,
    failed: 0,
    duplicates: 0,
    latencies: []
  };

  const startTime = Date.now();
  let lastPayload = null;

  for (let i = 0; i < config.count; i++) {
    const isDuplicate = Math.random() < config.duplicate && lastPayload !== null;
    const payload = isDuplicate ? lastPayload : generatePayload(i);
    
    if (!isDuplicate) {
      lastPayload = payload;
    } else {
      metrics.duplicates++;
    }

    try {
      const result = await publishMessage(payload);
      metrics.sent++;
      
      if (result.routed) {
        metrics.routed++;
      } else {
        metrics.failed++;
      }
      
      metrics.latencies.push(result.elapsed);
      
      if ((i + 1) % 10 === 0) {
        const inDepth = await getQueueDepth(IN_QUEUE);
        const outDepth = await getQueueDepth(OUT_QUEUE);
        console.log(`Progress: ${i + 1}/${config.count} | IN queue: ${inDepth} | OUT queue: ${outDepth}`);
      }
    } catch (err) {
      metrics.failed++;
      console.error(`Failed to publish message ${i}:`, err.message);
    }

    if (i < config.count - 1) {
      await sleep(intervalMs);
    }
  }

  const totalTime = Date.now() - startTime;
  const stats = calculateStats(metrics.latencies);

  console.log();
  console.log('=== Test Results ===');
  console.log(`Duration: ${(totalTime / 1000).toFixed(2)}s`);
  console.log(`Sent: ${metrics.sent}`);
  console.log(`Routed: ${metrics.routed}`);
  console.log(`Failed: ${metrics.failed}`);
  console.log(`Duplicates: ${metrics.duplicates}`);
  console.log(`Success rate: ${((metrics.routed / metrics.sent) * 100).toFixed(2)}%`);
  console.log(`Actual rate: ${(metrics.sent / (totalTime / 1000)).toFixed(2)} msgs/sec`);
  console.log();
  console.log('=== Publish Latency (ms) ===');
  console.log(`Min: ${stats.min}`);
  console.log(`Avg: ${stats.avg.toFixed(2)}`);
  console.log(`p50: ${stats.p50}`);
  console.log(`p95: ${stats.p95}`);
  console.log(`p99: ${stats.p99}`);
  console.log(`Max: ${stats.max}`);

  if (config.report) {
    const report = {
      config,
      metrics: {
        ...metrics,
        latencies: undefined // Exclude raw data
      },
      stats,
      duration: totalTime,
      timestamp: new Date().toISOString()
    };
    
    console.log();
    console.log('=== JSON Report ===');
    console.log(JSON.stringify(report, null, 2));
  }

  // Wait for processing
  console.log();
  console.log('Waiting 5 seconds for message processing...');
  await sleep(5000);
  
  const finalInDepth = await getQueueDepth(IN_QUEUE);
  const finalOutDepth = await getQueueDepth(OUT_QUEUE);
  
  console.log(`Final queue depths: IN=${finalInDepth}, OUT=${finalOutDepth}`);
}

main().catch(err => {
  console.error('Simulator error:', err.message);
  process.exit(1);
});
