# Contributing to My Car Pal

Thanks for wanting to help! My Car Pal is an owner-first vehicle maintenance command center — self-hostable, privacy-forward, and built to be welcoming to contributors.

## Code of Conduct

Be kind, constructive, and patient. Treat others the way you'd want your car treated.

## Getting Started

### Prerequisites

- Node.js 20.x
- Docker (for PostgreSQL; OrbStack works great on macOS)
- Git

### Local Setup

```bash
# Clone and install
git clone https://github.com/anthonyarmijo/my-car-pal.git
cd my-car-pal
cp .env.example .env
npm ci

# Start Postgres
npm run db:up

# Run migrations and seed
npx prisma migrate dev
npm run db:seed

# Start dev server
npm run dev
```

The app will be available at `http://localhost:3000`.

### Quick SQLite (no Docker)

Switch `prisma/schema.prisma` provider to `sqlite`, update `.env` to use `file:./dev.db`, then `npm run dev`.

## Development Workflow

### Conventional Commits

All commits must follow [Conventional Commits](https://www.conventionalcommits.org/):

```
type(scope): short description

Longer explanation if needed.
```

Types: `feat`, `fix`, `refactor`, `docs`, `test`, `ci`, `chore`, `perf`

Examples:
- `feat(garage): add VIN decode for motorcycles`
- `fix(maintenance): correct date rendering in US timezones`
- `docs(readme): update self-hosting instructions`

### Branch Naming

- `feat/description` — new features
- `fix/description` — bug fixes
- `refactor/description` — code restructuring
- `docs/description` — documentation
- `ci/description` — CI/CD changes

### Pull Requests

1. Branch from `main`
2. Make changes with clear commits
3. Push and open a PR
4. CI must pass (App Checks + scan)
5. PRs auto-merge when checks pass — no manual approval needed

### Running Tests

```bash
npm test                          # User isolation security test
npm run typecheck                 # TypeScript check
npm run lint                      # ESLint
npm run verify:design-system      # Full design-system gate (tokens, build, smoke)
npm run test:design-system:routes # Public/auth route smoke tests
```

### CI Pipeline

CI runs on every push and PR. The pipeline is:

| Job | What It Checks |
|-----|---------------|
| UI Checks | Package boundary, tarball audit |
| Typecheck | `tsc --noEmit` |
| Lint | `next lint` |
| Tests | User isolation security test |
| Design System | Token sync, build, route smoke, visual smoke |
| App Checks | Aggregate gate (passes when all above pass) |
| Secret Scan | Gitleaks secret detection |

## Project Structure

```
my-car-pal/
  app/               # Next.js App Router pages and API routes
  components/        # App-owned React components
  lib/               # Server utilities, auth, storage
  packages/ui/       # @my-car-pal/ui design system package
  prisma/            # Database schema and migrations
  public/            # Static assets
  scripts/           # Dev, CI, and verification scripts
  docs/              # Developer and infrastructure docs
```

### Design System

The `@my-car-pal/ui` package contains shared primitives (Button, Card, Badge, FormMessage, EmptyState) with Desert Graphite tokens. App surfaces should use package primitives where possible. `components/ui/` holds legacy adapters scheduled for migration.

## Where to Help

- **Good first issues:** Look for issues labeled `good first issue`
- **Documentation:** README, inline docs, SELF_HOSTING.md improvements
- **Bug reports:** Open an issue with reproduction steps
- **Feature ideas:** Discuss in an issue before building

## Security

See [SECURITY.md](SECURITY.md) for reporting vulnerabilities. Never commit secrets, `.env` files, or private keys.

## Questions?

Open a discussion or issue — happy to help you get started.
