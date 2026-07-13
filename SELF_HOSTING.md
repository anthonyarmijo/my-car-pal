# Self-Hosting My Car Pal

Run My Car Pal on your own hardware with Docker and Postgres. No cloud dependencies, no subscriptions, no data leaving your machine.

## Quick Start

```bash
git clone https://github.com/anthonyarmijo/my-car-pal.git
cd my-car-pal
cp .env.example .env
docker compose up -d
npm ci && npx prisma migrate dev && npm run dev
```

Open `http://localhost:3000`, create an account, and add your first vehicle.

## Requirements

- **Docker** (Docker Desktop, OrbStack, or Colima)
- **Node.js 20.x**
- **npm 10.x+**
- About 500MB disk for images and database

## Environment Variables

Copy `.env.example` to `.env` and configure:

### Required

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | Postgres connection string | `postgresql://mycarpal:password@localhost:55432/mycarpal?schema=public` |
| `BETTER_AUTH_SECRET` | Auth encryption key | Generate: `openssl rand -hex 32` |
| `BETTER_AUTH_URL` | Public URL of your app | `http://localhost:3000` |
| `NEXT_PUBLIC_BETTER_AUTH_URL` | Same as above (browser-visible) | `http://localhost:3000` |

### Optional

| Variable | Description |
|----------|-------------|
| `POSTGRES_HOST_PORT` | Postgres port on host (default: `55432`) |
| `APP_HOST_PORT` | App port on host (default: `3000`) |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Google OAuth (social login) |
| `APPLE_CLIENT_ID` / `APPLE_CLIENT_SECRET` / `APPLE_TEAM_ID` / `APPLE_KEY_ID` / `APPLE_PRIVATE_KEY` | Apple Sign In |
| `NEXT_PUBLIC_ENABLE_SOCIAL_AUTH` | Set to `1` to show social login buttons |
| `FILE_STORAGE_DRIVER` | `local` (default) for disk storage |

### Social Auth

Email/password works out of the box. Google and Apple sign-in require developer accounts and app registration — leave them empty if you don't need social login.

## Docker Compose

The included `docker-compose.yml` provides:

| Service | Port | Purpose |
|---------|------|---------|
| `postgres` | `55432` (host) | PostgreSQL 16 database |
| `app` | `3000` (host) | Next.js production build |
| `adminer` | `8080` (host) | Database UI (optional) |

### Common Commands

```bash
npm run db:up       # Start Postgres
npm run db:down     # Stop Postgres
npm run db:reset    # Wipe and recreate database
npm run docker:up   # Start full stack (app + Postgres + Adminer)
npm run docker:down # Stop full stack
```

## Database

My Car Pal uses PostgreSQL with Prisma ORM.

### First Run

```bash
npx prisma migrate dev    # Apply migrations
npm run db:seed           # Seed optional demo data
```

### Reset Database

```bash
npm run db:reset    # Drops and recreates from migrations
```

### SQLite Alternative

If you don't want to run Postgres, switch `prisma/schema.prisma`:

```diff
- provider = "postgresql"
+ provider = "sqlite"
```

Then in `.env`:

```
DATABASE_URL=file:./dev.db
```

Run `npx prisma migrate dev` and you're set — no Docker needed.

## File Storage

By default, uploads go to `public/uploads/` on local disk. Set `FILE_STORAGE_DRIVER=local` (the default). No S3, no cloud storage, no external dependencies.

## Production Deployment

For production self-hosting:

1. Generate a strong `BETTER_AUTH_SECRET`
2. Set `BETTER_AUTH_URL` to your production URL
3. Build and run with Docker:

```bash
docker compose up -d app
```

The Dockerfile handles `npm ci`, Prisma client generation, Next.js build, and database migration on startup.

### Reverse Proxy

Put nginx, Caddy, or Traefik in front of port 3000. Example Caddyfile:

```
mycarpal.example.com {
    reverse_proxy localhost:3000
}
```

## Upgrading

```bash
git pull origin main
npm ci
npx prisma migrate deploy
docker compose up -d --build app
```

## Limitations

- **Hosted-service integrations are not included.** The self-hosted application uses local authentication, PostgreSQL, and local file storage by default.
- **Single user per instance** is the default experience. Multi-user household support is on the roadmap.
- **Email delivery** is not included. Password reset and email verification require wiring your own SMTP provider.
- **Vehicle image catalog** uses curated Wikimedia Commons assets. You may want to run `npm run catalog:sync` and `npm run catalog:images:import` after first setup.

## Getting Help

- [GitHub Issues](https://github.com/anthonyarmijo/my-car-pal/issues)
- [CONTRIBUTING.md](CONTRIBUTING.md)
