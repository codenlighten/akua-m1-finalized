/**
 * opreturn-anchor.js
 * Build a transaction that spends stored/fetched UTXOs, adds a custom OP_RETURN,
 * sends change back to AKUA_FUNDING_ADDR, and updates local UTXO cache.
 *
 * Usage examples:
 *   node scripts/opreturn-anchor.js --optext "hello akua" --feePerKb 1000 --broadcast
 *   node scripts/opreturn-anchor.js --ophex 6a0b68656c6c6f21 --broadcast
 *   node scripts/opreturn-anchor.js --refreshUtxo --optext "new"  (fetch latest UTXOs)
 *
 * Flags:
 *   --optext <string>    Text to embed in OP_RETURN (UTF-8)
 *   --ophex <hex>        Raw hex payload for OP_RETURN
 *   --sats <n>           Satoshis to attach to OP_RETURN output (default 0)
 *   --feePerKb <n>       Fee rate (default 1000 sats/kB)
 *   --broadcast          Broadcast via WhatsOnChain mainnet
 *   --refreshUtxo        Force-refresh UTXOs from WhatsOnChain and cache
 *
 * Cache file: scripts/utxos.json (never broadcast without confirming correctness).
 */

const fs = require('fs')
const path = require('path')
const bsv = require('@smartledger/bsv')
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
    optext: null,
    ophex: null,
    sats: 0,
    feePerKb: 1000,
    broadcast: false,
    refreshUtxo: false
  }

  for (let i = 0; i < args.length; i++) {
    const a = args[i]
    if (a === '--optext') out.optext = args[++i]
    else if (a === '--ophex') out.ophex = args[++i]
    else if (a === '--sats') out.sats = parseInt(args[++i], 10)
    else if (a === '--feePerKb') out.feePerKb = parseInt(args[++i], 10)
    else if (a === '--broadcast') out.broadcast = true
    else if (a === '--refreshUtxo') out.refreshUtxo = true
  }

  if (!out.optext && !out.ophex) {
    console.error('Provide --optext <string> or --ophex <hex>')
    process.exit(1)
  }
  if (Number.isNaN(out.sats)) {
    console.error('--sats must be a number')
    process.exit(1)
  }
  return out
}

function loadUtxos() {
  if (!fs.existsSync(UTXO_DB)) return []
  try {
    const data = JSON.parse(fs.readFileSync(UTXO_DB, 'utf8'))
    return Array.isArray(data) ? data : []
  } catch (e) {
    console.warn('Could not read utxos.json, starting empty')
    return []
  }
}

function saveUtxos(list) {
  fs.writeFileSync(UTXO_DB, JSON.stringify(list, null, 2))
}

async function fetchUtxos(address) {
  const url = `https://api.whatsonchain.com/v1/bsv/main/address/${address}/unspent`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`UTXO fetch failed: ${res.status} ${res.statusText}`)
  const utxos = await res.json()
  if (!Array.isArray(utxos) || utxos.length === 0) {
    throw new Error('No UTXOs found for funding address')
  }
  // Normalize to satoshis field
  return utxos.map(u => ({
    txid: u.tx_hash || u.txid,
    vout: typeof u.tx_pos === 'number' ? u.tx_pos : u.vout,
    // WhatsOnChain returns value in satoshis already
    satoshis: typeof u.value === 'number' ? u.value : u.satoshis,
    script: bsv.Script.buildPublicKeyHashOut(FUNDING_ADDR).toHex()
  }))
}

function selectUtxos(utxos, amountNeeded) {
  let total = 0
  const selected = []
  for (const u of utxos) {
    selected.push(u)
    total += u.satoshis
    if (total >= amountNeeded) break
  }
  if (total < amountNeeded) {
    throw new Error(`Insufficient funds. Needed ${amountNeeded} sats, have ${total} sats`)
  }
  return { selected, total }
}

function buildOpReturnScript(optext, ophex) {
  let dataBuf
  if (ophex) {
    dataBuf = Buffer.from(ophex.replace(/^0x/, ''), 'hex')
  } else {
    dataBuf = Buffer.from(optext, 'utf8')
  }
  // Use OP_FALSE OP_RETURN to satisfy standard relay/data-carrier policy
  const s = new bsv.Script()
  s.add(bsv.Opcode.OP_FALSE)
  s.add(bsv.Opcode.OP_RETURN)
  s.add(dataBuf)
  return s
}

function buildTx(utxos, opScript, opSats, feePerKb) {
  const tx = new bsv.Transaction()

  utxos.forEach(u => {
    tx.from({
      txId: u.txid,
      outputIndex: u.vout,
      script: u.script,
      satoshis: u.satoshis
    })
  })

  tx.addOutput(new bsv.Transaction.Output({
    script: opScript,
    satoshis: opSats || 0
  }))

  tx.change(FUNDING_ADDR)
  tx.feePerKb(feePerKb)
  tx.sign(fundingKey)
  return tx
}

function extractChangeUtxo(tx) {
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

  // Load or fetch UTXOs
  let utxos = loadUtxos()
  if (args.refreshUtxo || utxos.length === 0) {
    utxos = await fetchUtxos(FUNDING_ADDR)
    saveUtxos(utxos)
    console.log(`Fetched ${utxos.length} UTXO(s) from WhatsOnChain and cached in utxos.json`)
  }

  const opScript = buildOpReturnScript(args.optext, args.ophex)
  // Estimate: need at least opSats + fee; select generously by adding 10k buffer
  const amountNeeded = args.sats + 10000
  const { selected } = selectUtxos(utxos, amountNeeded)

  const tx = buildTx(selected, opScript, args.sats, args.feePerKb)

  const raw = tx.toString('hex')
  console.log('TXID:', tx.id)
  console.log('Raw TX (hex):')
  console.log(raw)

  const changeUtxo = extractChangeUtxo(tx)
  if (changeUtxo) {
    console.log('\nChange:', changeUtxo.satoshis, 'sats ->', FUNDING_ADDR)
  } else {
    console.warn('No change output found; utxos.json not updated.')
  }

  if (args.broadcast) {
    const result = await broadcast(raw)
    console.log('\nBroadcast result:', result)
    if (changeUtxo) {
      saveUtxos([changeUtxo])
      console.log('utxos.json updated with new change output after successful broadcast.')
    }
  } else {
    console.log('\nNot broadcast. Use --broadcast to push via WhatsOnChain.')
  }
}

main().catch(err => {
  console.error('Error:', err.message)
  process.exit(1)
})
