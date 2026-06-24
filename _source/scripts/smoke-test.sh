#!/usr/bin/env bash
# Plumbline v1.0 Phase 1 smoke test
# Hits every public + app route under the /plumbline-demo/ base path.
# Exits non-zero on any non-2xx response.
set -uo pipefail

BASE="${SMOKE_BASE:-https://boidexter07-sys.github.io/plumbline-demo}"

ROUTES=(
  "/"
  "/pricing/"
  "/about/"
  "/faq/"
  "/terms/"
  "/privacy/"
  "/404.html"
  "/auth/"
  "/auth/sign-in/"
  "/auth/verify/"
  "/auth/forgot-password/"
  "/holdings/"
  "/pulse/"
  "/brief/"
  "/markets/"
  "/sandbox/"
  "/leaderboard/"
  "/model-details/"
  "/settings/"
)

fail=0
for r in "${ROUTES[@]}"; do
  code=$(curl -sk -o /dev/null -w "%{http_code}" -L "${BASE}${r}")
  printf "  %-22s -> %s\n" "$r" "$code"
  if [[ ! "$code" =~ ^2 ]]; then
    fail=1
  fi
done

# Regression check: 404 page must not contain the spec-template line
if curl -s "${BASE}/404.html" | grep -q "12 · CALM"; then
  echo "  REGRESSION: 404.html contains forbidden '12 · CALM' line"
  fail=1
else
  echo "  404 regression check: OK"
fi

if [[ "$fail" -ne 0 ]]; then
  echo "SMOKE TEST FAILED"
  exit 1
fi

echo "SMOKE TEST PASSED"
