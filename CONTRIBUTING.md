# Contributing

Thanks for helping make My Car Pal a practical, privacy-forward vehicle maintenance command center.

## Local Setup

Prerequisites:

- Node.js 20+
- Docker

```bash
npm install
cp .env.example .env
npm run db:up
npx prisma migrate dev
npm run dev
```

The app runs at [http://localhost:3000](http://localhost:3000). Adminer runs at [http://localhost:8080](http://localhost:8080).

## Verification

Run the checks that match your change:

```bash
npm run build
npm run test:security:isolation
POSTGRES_HOST_PORT=55432 docker compose build app
POSTGRES_HOST_PORT=55432 docker compose up -d app adminer
curl http://localhost:3000/api/health
```

Use `FILE_STORAGE_DRIVER=local` for public-core development unless you are intentionally testing an optional storage adapter.

## Public Core Boundaries

Public-core contributions should keep the app self-hostable from a fresh checkout with Docker/Postgres and local storage. New core work should not require Vercel, Neon, Vercel Blob, Stripe, private domains, production deployment protection, or managed-cloud business logic.

Keep these areas out of public-core changes unless an explicit adapter or private-cloud boundary has been approved:

- billing, subscriptions, payment-provider webhooks, and premium entitlement rules
- production deployment configuration and generated provider metadata
- managed sync or customer operations
- private roadmap, launch planning, pricing experiments, and sensitive infrastructure history
- credentials, environment files, customer data, logs, and incident artifacts

Schema changes should be additive and migration-safe whenever possible. Destructive migrations, especially billing/subscription changes, need an explicit owner decision.

## Documentation

When product behavior changes, update:

- `README.md`
- `CHANGELOG.md`
- relevant docs under `docs/dev/`

Do not add a license file or choose an open-source license without owner approval.
