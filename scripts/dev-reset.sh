#!/usr/bin/env bash
set -euo pipefail

rm -rf .next
npm run db:push

echo "Reset complete. Run: npm run dev"
