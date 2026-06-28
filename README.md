# My Car Pal

![My Car Pal banner](docs/assets/readme-banner.png)

**My Car Pal** is an open-source, self-hostable vehicle maintenance command center — a clean, privacy-forward way to manage your garage, track service history, and stay on top of what your vehicles need next.

→ **[mycarpal.app](https://mycarpal.app)** — hosted SaaS with premium features, email reminders, and household sharing.

[![License: AGPL v3](https://img.shields.io/badge/License-AGPL_v3-blue.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org)

---

## Features

### 🚗 Garage & Vehicle Profiles
- Add cars, trucks, motorcycles, and scooters
- VIN decoding with manual fallback
- Trim, plate, and mileage tracking
- Per-vehicle document and image uploads

### 🔧 Maintenance Tracking
- Service logs with receipts
- Manual and recurring reminders
- Curated maintenance schedules for popular cars and motorcycles
- Upcoming maintenance dashboard with date controls

### 📋 Glovebox
- Registration and insurance policy management
- Uploaded documents with category organization
- Per-user visibility and ownership checks

### 🏠 Home Dashboard
- At-a-glance vehicle command panel with quick odometer controls
- Alerts for maintenance, registration, and insurance due dates
- Setup checklist for new users
- Local weather badge

### 🛠️ DIY Learning Center
- Category-based how-to articles
- Tools, safety, and resource guides per procedure

### 🔍 Mechanic Lookup
- OpenStreetMap-based local shop search
- Non-sponsored, privacy-respecting

### 🎨 Design
- **Desert Graphite** workspace — clean, modern, Things 3/YNAB-inspired
- System-aware light/dark theme support
- Geist typeface, accessible color palette

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js 15 (App Router) |
| **Language** | TypeScript |
| **Database** | PostgreSQL (Prisma ORM) |
| **Auth** | Better Auth (email/password + optional social) |
| **Storage** | Local filesystem (default) or Vercel Blob |
| **Container** | Docker + Docker Compose |
| **Deployment** | Self-hosted Node/Docker target |
| **CI/CD** | GitHub Actions |
| **Design System** | `@my-car-pal/ui` workspace package + Storybook |

---

## Quick Start

### Prerequisites
- Node.js 20+
- Docker

### 1. Clone & Install
```bash
git clone https://github.com/anthonyarmijo/my-car-pal.git
cd my-car-pal
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env
```

Edit `.env` and set `BETTER_AUTH_SECRET`:
```bash
openssl rand -hex 32
```

### 3. Start the Database
```bash
npm run db:up
```

### 4. Run Migrations
```bash
npx prisma migrate dev
```

### 5. Start the App
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and create an account.

### Docker (Full Stack)
```bash
cp .env.example .env
npm run docker:up
```

This starts the app, PostgreSQL, and Adminer (DB browser at [http://localhost:8080](http://localhost:8080)) in one command.

---

## Environment Variables

| Variable | Required | Default | Notes |
|---------|----------|---------|-------|
| `DATABASE_URL` | ✅ | — | PostgreSQL connection string |
| `DIRECT_URL` | ✅ | — | Direct (non-pooled) connection for migrations |
| `POSTGRES_HOST_PORT` | ✅ | `55432` | Docker host port for Postgres |
| `BETTER_AUTH_SECRET` | ✅ | — | Session encryption secret |
| `BETTER_AUTH_URL` | ✅ | `http://localhost:3000` | App base URL |
| `NEXT_PUBLIC_BETTER_AUTH_URL` | ✅ | `http://localhost:3000` | Public auth URL |
| `FILE_STORAGE_DRIVER` | — | `local` | `local` or `vercel-blob` |
| `NEXT_PUBLIC_ENABLE_SOCIAL_AUTH` | — | `0` | Enable Google sign-in |
| `GOOGLE_CLIENT_ID` | — | — | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | — | — | Google OAuth client secret |
| `BLOB_READ_WRITE_TOKEN` | — | — | Vercel Blob token (when using `vercel-blob`) |

---

## Architecture

```
┌──────────────────────────────────────────────────┐
│                    Browser                        │
└──────────────────────┬───────────────────────────┘
                       │
┌──────────────────────▼───────────────────────────┐
│              Next.js App Router                   │
│  ┌──────────┐  ┌───────────┐  ┌───────────────┐  │
│  │  Public   │  │   Auth    │  │ Authenticated │  │
│  │  Routes   │  │  Routes   │  │    Routes     │  │
│  │ /, /about │  │ /login,   │  │ /home, /garage│  │
│  │ /contact  │  │ /register │  │ /maintenance  │  │
│  └──────────┘  └───────────┘  └───────────────┘  │
│                                                    │
│  ┌──────────────────────────────────────────────┐  │
│  │              Better Auth                      │  │
│  │   Rate-limited • IP-hashed • Session-based   │  │
│  └──────────────────────────────────────────────┘  │
│                                                    │
│  ┌──────────────┐  ┌────────────────────────────┐  │
│  │ Local Storage │  │     Vercel Blob (opt.)     │  │
│  │ public/uploads│  │     Managed file store     │  │
│  └──────────────┘  └────────────────────────────┘  │
└──────────────────────┬───────────────────────────┘
                       │
┌──────────────────────▼───────────────────────────┐
│             PostgreSQL (Prisma ORM)                │
│  Users • Vehicles • Maintenance • Reminders       │
│  Glovebox Docs • Insurance • DefaultVehicleImage  │
└──────────────────────────────────────────────────┘
```

### Deployment Architecture (SaaS)

The hosted version at [mycarpal.app](https://mycarpal.app) runs on:

- **Vercel** — Git-pushed deployments from `main`, preview deploys from `dev`
- **Neon** — Serverless Postgres with separate preview/production projects
- **Vercel Blob** — Managed file storage for user uploads
- **GitHub Actions** — CI verification, migration guards, health checks
- **Cloudflare** — DNS management for `mycarpal.app`

Protected preview deployments at `dev.mycarpal.app` gate unreleased changes behind Vercel deployment protection.

---

## Project Structure

```
├── app/                  # Next.js App Router pages
│   ├── home/             # Authenticated dashboard
│   ├── garage/           # Vehicle management
│   ├── maintenance/      # Service logs & reminders
│   ├── glovebox/         # Documents & insurance
│   ├── vehicle/[id]/     # Per-vehicle detail
│   ├── diy/              # Learning center
│   ├── profile/          # User settings
│   ├── about/            # Public about page
│   ├── contact/          # Contact form
│   ├── privacy/          # Privacy policy
│   ├── terms/            # Terms of service
│   └── api/              # API routes
├── components/           # Shared React components
├── packages/ui/          # Presentational design-system primitives and tokens
├── lib/                  # Business logic, catalog, vehicle-images
├── prisma/               # Database schema & migrations
├── data/                 # Vehicle image catalogs & attribution
├── scripts/              # Dev tooling, catalog sync, security tests
├── emails/               # Transactional email templates (managed cloud)
├── docs/                 # Infrastructure & architecture docs
├── public/images/        # Static assets & vehicle default images
├── docker-compose.yml    # Local Docker stack
└── Dockerfile            # Production Docker image
```

---

## Useful Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start PostgreSQL, then Next.js dev server |
| `npm run db:up` | Start PostgreSQL container |
| `npm run db:down` | Stop PostgreSQL container |
| `npm run db:reset` | Reset database and re-run migrations |
| `npm run db:studio` | Open Prisma Studio (DB browser) |
| `npm run db:migrate` | Run development migrations |
| `npm run docker:up` | Start full Docker app + database stack |
| `npm run docker:down` | Stop Docker stack |
| `npm run docker:logs` | Tail app container logs |
| `npm run build` | Production build |
| `npm run build:ui` | Type-check the `@my-car-pal/ui` package |
| `npm run build-storybook` | Build isolated design-system Storybook |
| `npm run verify:design-system` | Run the full design-system verification gate |
| `npm run verify:storybook:visual` | Build Storybook and run Playwright visual smoke checks |
| `npm run test:design-system:routes` | Smoke migrated design-system app routes against a production server |
| `npm run test:design-system:rendered` | Run desktop/mobile rendered app smoke checks and save screenshots outside the repo |
| `npm run check:ui-boundary` | Ensure the UI package does not import app/server/provider code |
| `npm run check:ui-pack` | Dry-run the UI package tarball and block internal fixtures from package output |
| `npm run check:ui-tokens` | Ensure generated token JSON matches the TypeScript token source |
| `npm run test:security:isolation` | Verify per-user data isolation |

---

## Design System

The first app-owned design-system package lives in `packages/ui`. It contains
presentational primitives, Desert Graphite CSS tokens, a structured token
manifest with a checked JSON snapshot, Storybook stories, and package-boundary
checks. CI runs `npm run verify:design-system` for pull requests and protected
branches.

Design-system docs:
- `docs/design-system/architecture.md`
- `docs/design-system/migration-notes.md`
- `docs/design-system/design-sync-readiness.md`
- `docs/design-system/verification-audit.md`

---

## SaaS Offering

**[mycarpal.app](https://mycarpal.app)** is the hosted, managed version of My Car Pal — no setup required. It includes everything in the open-source core plus:

- **Email reminders & digests** — never miss a service interval
- **Multi-vehicle households** — share vehicles across family members
- **Cost tracking & reports** — understand your vehicle expenses
- **Priority support**

[Start free →](https://mycarpal.app/register)

---

## Contributing

My Car Pal welcomes contributions. See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines, local setup, and issue templates.

- **Bug reports & feature requests** → [GitHub Issues](https://github.com/anthonyarmijo/my-car-pal/issues)
- **Security disclosures** → See [SECURITY.md](SECURITY.md)
- **Support questions** → See [SUPPORT.md](SUPPORT.md)

---

## License

My Car Pal is licensed under the [GNU Affero General Public License v3.0](LICENSE) (AGPL-3.0). This means you can use, modify, and distribute the software freely — and if you run a modified version as a network service, you must make your changes available under the same license.
