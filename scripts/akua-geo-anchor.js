/**
 * akua-geo-anchor.js
 * Build and (optionally) broadcast an OP_FALSE OP_RETURN anchor for a GEO tag
 * using AkuaGeoBox for hashing/payload creation. Change returns to funding addr.
 *
 * Usage example:
 *   node scripts/akua-geo-anchor.js --deviceId DEV1 --lat 33.6 --lon -117.9 --packageId PKG1 --broadcast
 *
 * Flags (required):
 *   --deviceId <id>
 *   --lat <number>
 *   --lon <number>
 *
 * Optional flags:
 *   --packageId <id>
 *   --alt <number>
 *   --timestamp <iso8601>
 *   --telemetry '<json>'
 *   --feePerKb <n>        (default 1000)
 *   --broadcast           (default dry-run)
 */

const fs = require('fs')
const path = require('path')
const bsv = require('@smartledger/bsv')
const { AkuaGeoBox } = require('../lib/akuaGeoBox')
require('dotenv').config({ path: path.join(__dirname, '..', '.env') })

const FUNDING_WIF = process.env.AKUA_FUNDING_WIF
const FUNDING_ADDR = process.env.AKUA_FUNDING_ADDR
if (!FUNDING_WIF || !FUNDING_ADDR) {
  console.error('Missing AKUA_FUNDING_WIF or AKUA_FUNDING_ADDR in .env')
  process.exit(1)
}

const fundingKey = bsv.PrivateKey.fromWIF(FUNDING_WIF)
const UTXO_DB = path.join(__dirname, 'utxos.json')

function parseArgs() {
  const args = process.argv.slice(2)
  const out = {
    deviceId: null,
    packageId: null,
    lat: null,
    lon: null,
    alt: null,
    timestamp: null,
    telemetry: null,
    feePerKb: 1000,
    broadcast: false
  }

  for (let i = 0; i < args.length; i++) {
    const a = args[i]
    if (a === '--deviceId') out.deviceId = args[++i]
    else if (a === '--packageId') out.packageId = args[++i]
    else if (a === '--lat') out.lat = parseFloat(args[++i])
    else if (a === '--lon') out.lon = parseFloat(args[++i])
    else if (a === '--alt') out.alt = parseFloat(args[++i])
    else if (a === '--timestamp') out.timestamp = args[++i]
    else if (a === '--telemetry') {
      try {
        out.telemetry = JSON.parse(args[++i])
      } catch (e) {
        console.error('Invalid telemetry JSON')
        process.exit(1)
      }
    }
    else if (a === '--feePerKb') out.feePerKb = parseInt(args[++i], 10)
    else if (a === '--broadcast') out.broadcast = true
  }

  if (!out.deviceId || Number.isNaN(out.lat) || Number.isNaN(out.lon)) {
    console.error('Usage: --deviceId <id> --lat <num> --lon <num> [--packageId <id>] [--alt <num>] [--timestamp <iso>] [--telemetry json] [--feePerKb n] [--broadcast]')
    process.exit(1)
  }

  return out
}

async function fetchUtxos(address) {
  const url = `https://api.whatsonchain.com/v1/bsv/main/address/${address}/unspent`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`UTXO fetch failed: ${res.status} ${res.statusText}`)
  const utxos = await res.json()
  if (!Array.isArray(utxos) || utxos.length === 0) throw new Error('No UTXOs found for funding address')
  return utxos.map(u => ({
    txid: u.tx_hash || u.txid,
    vout: typeof u.tx_pos === 'number' ? u.tx_pos : u.vout,
    satoshis: typeof u.value === 'number' ? u.value : u.satoshis,
    script: bsv.Script.buildPublicKeyHashOut(FUNDING_ADDR).toHex()
  }))
}

function selectUtxos(utxos, needed) {
  let total = 0
  const chosen = []
  for (const u of utxos) {
    chosen.push(u)
    total += u.satoshis
    if (total >= needed) break
  }
  if (total < needed) throw new Error(`Insufficient funds: need ${needed}, have ${total}`)
  return { chosen, total }
}

function buildOpFalseReturn(payloadStr) {
  const s = new bsv.Script()
  s.add(bsv.Opcode.OP_FALSE)
  s.add(bsv.Opcode.OP_RETURN)
  s.add(Buffer.from(payloadStr, 'utf8'))
  return s
}

function buildTx(inputs, opScript, feePerKb) {
  const tx = new bsv.Transaction()
  inputs.forEach(u => {
    tx.from({
      txId: u.txid,
      outputIndex: u.vout,
      script: u.script,
      satoshis: u.satoshis
    })
  })

  tx.addOutput(new bsv.Transaction.Output({ script: opScript, satoshis: 0 }))
  tx.change(FUNDING_ADDR)
  tx.feePerKb(feePerKb)
  tx.sign(fundingKey)
  return tx
}

function extractChange(tx) {
  const changeScript = bsv.Script.buildPublicKeyHashOut(FUNDING_ADDR).toHex()
  const idx = tx.outputs.findIndex(o => o.script.toHex() === changeScript)
  if (idx === -1) return null
  return {
    txid: tx.id,
    vout: idx,
    satoshis: tx.outputs[idx].satoshis,
    script: changeScript
  }
}

async function broadcast(txhex) {
  const url = 'https://api.whatsonchain.com/v1/bsv/main/tx/raw'
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ txhex })
  })
  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`Broadcast failed: ${res.status} ${res.statusText} :: ${body}`)
  }
  return res.json()
}

async function main() {
  const args = parseArgs()
  const geoBox = new AkuaGeoBox()

  const geoResult = await geoBox.run({
    operation: 'process_geotag',
    device_id: args.deviceId,
    package_id: args.packageId,
    latitude: args.lat,
    longitude: args.lon,
    altitude: args.alt,
    timestamp: args.timestamp,
    telemetry: args.telemetry
  })

  if (geoResult.status !== 'SUCCESS') {
    console.error('Geo processing failed:', geoResult.error)
    process.exit(1)
  }

  const payload = geoResult.payload.anchorPayload
  const payloadStr = JSON.stringify(payload)
  const opScript = buildOpFalseReturn(payloadStr)

  const utxos = await fetchUtxos(FUNDING_ADDR)
  const needed = 10000 // buffer for fee + change
  const { chosen } = selectUtxos(utxos, needed)

  const tx = buildTx(chosen, opScript, args.feePerKb)
  const raw = tx.toString('hex')
  const change = extractChange(tx)

  console.log('TXID:', tx.id)
  console.log('Anchor hash:', geoResult.payload.anchorHash)
  console.log('OP_RETURN bytes:', payloadStr.length)
  console.log('Change:', change ? change.satoshis : 'none', '->', FUNDING_ADDR)
  console.log('\nRaw TX (hex):')
  console.log(raw)

  if (args.broadcast) {
    const result = await broadcast(raw)
    console.log('\nBroadcast result:', result)
    if (change) {
      fs.writeFileSync(UTXO_DB, JSON.stringify([change], null, 2))
      console.log('utxos.json updated with change output.')
    }
  } else {
    console.log('\nNot broadcast. Add --broadcast to send via WhatsOnChain.')
  }
}

main().catch(err => {
  console.error('Error:', err.message)
  process.exit(1)
})
