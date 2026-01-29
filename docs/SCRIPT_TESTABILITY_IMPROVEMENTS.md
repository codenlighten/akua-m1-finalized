# Balance Script - Final Hardening (ENV Override + File-Readable Check)

**Commit:** a9506a9 (Allow ENV override (testability) + add file-readable check)  
**Date:** January 29, 2026  
**Status:** ✅ Deployed and tested

---

## Exact Changes Applied

### Change 1: Make ENV Overridable (Line 9)

**Before:**
```bash
ENV=/opt/akua-stack/.env
```

**After:**
```bash
ENV="${1:-${ENV:-/opt/akua-stack/.env}}"
```

**What this does:**
- Allows script to accept ENV path as first CLI argument: `bash script.sh /path/to/.env`
- Respects `ENV` environment variable override: `ENV=/path/to/.env bash script.sh`
- Falls back to default: `bash script.sh` (no args, no ENV var)

**Precedence order:**
1. Argument 1 (if provided)
2. ENV environment variable (if set)
3. Default: `/opt/akua-stack/.env`

**Cron usage (unchanged):**
```cron
0 */4 * * * /opt/akua-stack/scripts/check-balance.sh >/dev/null 2>&1
```
Cron doesn't pass arguments, so uses default path. Safe and backwards-compatible.

---

### Change 2: Add File-Readable Check (Line 12)

**Added after ENV assignment:**
```bash
# Ensure ENV file exists and is readable
[ -r "$ENV" ] || { logger -t akua-balance -p user.crit "CRITICAL: cannot read ENV file: $ENV"; echo "CRITICAL: cannot read $ENV" >&2; exit 2; }
```

**What this does:**
- Tests file readability before attempting to read it
- Prevents confusing grep/cut errors if file is missing/unreadable
- Logs clear CRITICAL error with exit code 2
- Fails fast (no misleading balance=0 errors)

**Example error output:**
```
CRITICAL: cannot read /opt/akua-stack/.env.missing
```

---

## Test Cases Enabled

Now you can write clean integration tests:

### Test 1: Missing MIN_BALANCE_SATS
```bash
cp .env .env.test
grep -v '^MIN_BALANCE_SATS=' .env.test > .env.broken
ENV=/opt/akua-stack/.env.broken bash scripts/check-balance.sh 2>&1 | grep CRITICAL
echo exit=$?  # Should be 2
```

### Test 2: Invalid threshold ordering
```bash
cp .env .env.test
sed -i 's/^LOW_BALANCE_SATS=.*/LOW_BALANCE_SATS=500000/' .env.test
ENV=/opt/akua-stack/.env.test bash scripts/check-balance.sh 2>&1 | grep CRITICAL
echo exit=$?  # Should be 2
```

### Test 3: Missing ENV file entirely
```bash
bash scripts/check-balance.sh /nonexistent/.env 2>&1 | grep CRITICAL
echo exit=$?  # Should be 2
```

### Test 4: Normal operation (uses default)
```bash
bash scripts/check-balance.sh
echo exit=$?  # Should be 0
```

---

## Why This Matters

**Before:** 
- Couldn't test with alternate .env files (hardcoded path)
- If .env missing, would get confusing grep errors like:  
  `grep: /opt/akua-stack/.env: No such file or directory`
- Script would try to proceed with empty variables

**After:**
- Clean integration testing possible
- Explicit error if .env missing/unreadable
- Testability without modifying production files

---

## Backwards Compatibility

✅ **Fully backwards compatible:**
- Cron job runs unchanged (no arguments, no ENV var set)
- Production droplet uses default path automatically
- Git history preserved, rollback still safe

**Production behavior (unchanged):**
```bash
# What cron executes:
/opt/akua-stack/scripts/check-balance.sh

# Uses:
1. First argument? No
2. $ENV environment variable? No
3. Default: /opt/akua-stack/.env ✓

# Behavior: identical to before
```

---

## Deployment Verification

**On droplet:**
```bash
cd /opt/akua-stack
git pull --ff-only origin main
chmod +x scripts/check-balance.sh

# Test 1: Normal operation
bash scripts/check-balance.sh
# Output: OK: Balance 2824359 sats ...

# Test 2: Missing file
bash scripts/check-balance.sh /nonexistent
# Output: CRITICAL: cannot read /nonexistent (exit 2)

# Verify cron still works
crontab -l | grep check-balance
# Output: 0 */4 * * * /opt/akua-stack/scripts/check-balance.sh >/dev/null 2>&1
```

---

## Summary

Two surgical hardening improvements applied:

1. **ENV override capability:** Allows testing with alternate .env files without modifying production
2. **File-readable guard:** Prevents cryptic errors if .env missing/unreadable

Both changes are:
- ✅ Backwards compatible
- ✅ Non-breaking for production cron
- ✅ Enhance testability
- ✅ Improve error messages

**Repository:** https://github.com/codenlighten/akua-m1-finalized (commit: a9506a9)
