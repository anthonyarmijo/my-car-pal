# Repository Sync Strategy (Sketch)

This is a planning document — do not implement sync automation from this sketch.

## Architecture

My Car Pal follows a public-core + private-overlay model:

```
my-car-pal (public)          my-car-pal-private (private)
├── app/                     ├── app/ (overlays)
├── components/              ├── lib/stripe/
├── lib/                     ├── lib/resend/
├── packages/ui/             ├── infra/terraform/
├── prisma/                  ├── vercel.json
├── docker-compose.yml       ├── .github/workflows/deploy.yml
├── SELF_HOSTING.md          └── private docs/planning/
└── ...
```

### What Stays Public

- App source code (Next.js pages, API routes, components)
- Design system (`@my-car-pal/ui`)
- Database schema (Prisma migrations)
- Docker and self-hosting tooling
- Documentation (README, CONTRIBUTING, SELF_HOSTING, CHANGELOG)

### What Stays Private

- Stripe billing integration
- Email delivery (Resend)
- Production deployment config (Vercel, Neon, Cloudflare)
- Terraform infrastructure
- Private planning, roadmap, business docs
- Secrets, API keys, environment-specific configuration

## Sync Direction

**Public → Private only.** The public repo is the source of truth for the core app. The private repo pulls in public changes and layers managed-cloud adaptations on top.

Reverse sync (private → public) should never happen — it risks leaking managed-cloud logic or secrets into the open-source repo.

## Recommended Approach (Future)

### Pattern: Scheduled Upstream Merge

The private repo treats the public repo as an upstream:

1. **Daily cron** checks for new commits on `my-car-pal/main`
2. If new commits exist, opens a PR in `my-car-pal-private` merging `public/main` → `private/main`
3. CI runs the full test suite against the merged code
4. Human review confirms no private logic was accidentally overwritten

### Conflict Resolution

When public changes touch files that the private repo also modifies:

- **Config files** (env, docker, CI): Private version wins; manually review
- **Source files** (app code): Public version wins; re-apply private adapters
- **Schema changes**: Both repos run the same Prisma migrations

### Private Overlay Files

Files that exist only in private and never sync to public:

```
my-car-pal-private/
  lib/stripe/             # Stripe checkout, portal, webhooks
  lib/resend/             # Email delivery
  app/api/stripe/         # Stripe API routes
  infra/terraform/        # Infrastructure as code
  vercel.json             # Vercel deployment config
  docs/private/           # Business planning
```

Files modified in private (overlaid on public base):

```
my-car-pal-private/
  .env.example            # Add Stripe/Resend/Neon variables
  docker-compose.yml      # Add optional managed services
  app/layout.tsx          # Add Stripe provider wrapper
  app/profile/page.tsx    # Add billing panel
```

## What Not To Do

- **Do not** sync `.env`, secrets, or private keys in either direction
- **Do not** add `NEXT_PUBLIC_*` variables that reference private infrastructure
- **Do not** add paid-plan gates or entitlement checks to the public core
- **Do not** merge private → public without a full scrub

## Trigger Mechanisms (Options)

| Approach | Pros | Cons |
|----------|------|------|
| GitHub Actions scheduled workflow | Simple, free | Polling delay |
| `repository_dispatch` webhook | Real-time | Requires PAT with cross-repo access |
| Manual `gh pr create` | Full control | Manual step |

A daily scheduled workflow is the recommended starting point — simple, safe, and good enough for a one-person project.

## Current State

- Old private repo archived as `my-car-pal-archive`
- Public core live at `my-car-pal`
- No sync automation implemented
- One remaining cross-repo secret (`CROSS_REPO_DISPATCH_PAT`) exists on the archived repo; may be useful for future webhook-based sync
