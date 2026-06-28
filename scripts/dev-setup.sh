#!/usr/bin/env bash
set -euo pipefail

if ! command -v npm >/dev/null 2>&1; then
  echo "npm not found. Install Node.js (recommended: nvm install 20)."
  exit 1
fi

if [ ! -f .env ]; then
  cp .env.example .env
fi

npm install
npm run db:generate
npm run db:push

if [ "${1:-}" = "--seed" ]; then
  npm run db:seed
fi

echo "Setup complete. Run: npm run dev"
