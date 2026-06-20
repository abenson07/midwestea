#!/usr/bin/env bash
# Staging smoke tests for Midwest EA Vercel deployment.
#
# Usage:
#   STAGING=https://your-project.vercel.app ./scripts/staging-smoke-test.sh
#
# If Vercel Deployment Protection is enabled on previews, set a bypass secret:
#   STAGING=https://... VERCEL_AUTOMATION_BYPASS_SECRET=xxx ./scripts/staging-smoke-test.sh
#
# Create the secret in Vercel → Project → Settings → Deployment Protection → Automation Bypass.

set -euo pipefail

STAGING="${STAGING:-http://localhost:3000}"
STAGING="${STAGING%/}"

CURL_OPTS=(-s -o /dev/null -w "%{http_code}")
if [ -n "${VERCEL_AUTOMATION_BYPASS_SECRET:-}" ]; then
  CURL_OPTS+=(-H "x-vercel-protection-bypass: ${VERCEL_AUTOMATION_BYPASS_SECRET}")
fi

pass=0
fail=0

check() {
  local label="$1"
  local path="$2"
  local expected="${3:-200}"
  local code
  code=$(curl "${CURL_OPTS[@]}" "${STAGING}${path}")
  if [ "$code" = "$expected" ]; then
    echo "PASS  $label ($code)"
    pass=$((pass + 1))
  else
    echo "FAIL  $label (expected $expected, got $code)"
    fail=$((fail + 1))
  fi
}

echo "Smoke testing: $STAGING"
if [ -n "${VERCEL_AUTOMATION_BYPASS_SECRET:-}" ]; then
  echo "Using Vercel deployment protection bypass"
else
  echo "No VERCEL_AUTOMATION_BYPASS_SECRET — if all checks return 401, enable bypass or disable preview protection"
fi
echo "---"

# Marketing
check "Homepage" "/"
check "About" "/about"
check "Courses gallery" "/courses"
check "BLS course" "/basic-life-support"
check "Purchase confirmation" "/purchase-confirmation/general"

# Platform
check "Admin login" "/admin/login"
check "Checkout details" "/checkout/details"

# Redirects
check "Legacy /dashboard/login" "/dashboard/login" "308"
check "Legacy /app/checkout/details" "/app/checkout/details" "308"
check "Template /course-template" "/course-template" "308"

echo "---"
echo "Passed: $pass  Failed: $fail"

if [ "$fail" -gt 0 ] && [ "$fail" -eq $((pass + fail)) ]; then
  echo ""
  echo "All requests failed — likely Vercel Deployment Protection (401)."
  echo "  • Test in browser while logged into Vercel, or"
  echo "  • Vercel → Settings → Deployment Protection → disable for Preview, or"
  echo "  • Add Automation Bypass Secret and re-run with VERCEL_AUTOMATION_BYPASS_SECRET=..."
fi

if [ "$fail" -gt 0 ]; then
  exit 1
fi
