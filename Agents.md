# AGENTS.md — My Car Pal (Codex Instructions)

## Purpose
This file defines product and implementation guardrails for contributors and coding agents.

## Product goal
Build **My Car Pal** as an owner-first vehicle maintenance command center that is:
- clean, modern, and easy to use
- privacy-forward and trust-first
- practical for everyday drivers, DIY users, and households

## Repository split direction
My Car Pal is moving from a single private app repo into a two-track structure:
- Public core: self-hostable app with local auth, Docker/Postgres, local storage, owner-first garage, maintenance, glovebox, DIY, reminders, alerts, and mechanic lookup.
- Private managed cloud: billing, premium entitlement rules, managed sync/customer operations, production deployment configuration, private roadmap/business planning, and sensitive infrastructure history.

Default new core work should avoid requiring Vercel, Neon, Vercel Blob, Stripe, private domains, or managed-cloud business logic. Keep provider-specific behavior behind optional adapters or private-cloud boundaries.

## Current product baseline (as of April 2026)
- Authenticated, user-scoped experience (per-user vehicles, maintenance, docs, reminders, alerts).
- Free-tier 1-vehicle gate enforced in app.
- Better Auth session/auth foundation with email/password and social provider support (Google/Apple wiring).
- Garage + vehicle profiles (VIN decode, car + motorcycle support, trim support, plate, mileage updates, document handling).
- Maintenance:
  - service logs with receipts
  - manual reminders
  - car interval imports and recalculation workflows
  - curated motorcycle owner-manual schedule imports for supported brands
  - upcoming maintenance with filtering and date controls
- Glovebox:
  - registration + insurance management
  - uploaded docs with categories and per-user visibility (Vercel Blob in deployed environments)
- Home alerts:
  - maintenance, registration, insurance due-state tracking
  - read/unread + remind-later behavior
- DIY learning center:
  - category-based article browsing
  - individual how-to pages with tools, safety, and resources
- Local mechanic lookup (OpenStreetMap source, non-sponsored messaging).

## UX / design direction
- Modern and clean visual system inspired by Things 3 and YNAB:
  - whitespace, readable typography, subdued colors, rounded surfaces
- Authenticated Home's current selected direction is "Desert Graphite":
  - graphite/near-black top nav
  - porcelain/white content and card surfaces
  - tobacco/copper primary accent
  - sand/taupe borders
  - muted blue-gray secondary states
  - sage only for positive/success states
- Keep navigation and section structure consistent across app pages.
- Maintain playful/friendly touches without sacrificing clarity.
- Tone: neutral, trustworthy, practical, empowering.

## Route map (current)
- `/` landing
- `/login`, `/register`
- `/home`
- `/garage`
- `/maintenance`, `/maintenance/[id]`
- `/glovebox`
- `/vehicle/[id]`
- `/diy`, `/diy/[slug]`
- `/profile`
- `/about`, `/contact`

## Infrastructure and deployment baseline
- Deployment target: Vercel (Git deployments) + Neon Postgres + Vercel Blob.
- `dev` is the protected preview branch in Vercel and `main` remains the production branch.
- Canonical Vercel project: `anthonyarmijos-projects / my-car-pal`; the similarly named `my-car-pal-private` Vercel project is stale/quarantined.
- Preview uses Neon project `my-car-pal-preview-db` with database `mycarpal`; production uses Neon project `my-car-pal-production-db` with database `mycarpal`.
- Managed deploy workflows must pin the canonical Vercel project and verify exact Neon pooled/direct hosts before running Prisma migrations.
- `https://mycarpal.app` is the public production domain and `https://www.mycarpal.app` should redirect to the apex.
- CI/CD standard is GitHub Actions for app verification; Vercel handles preview and production deployments from git.
- Keep secrets out of git. Vercel runtime secrets live in Vercel env vars; GitHub Actions migration/health-check secrets live in environment-scoped GitHub secrets.
- Domain DNS is currently Cloudflare-managed (`mycarpal.app`), so Route53 usage is optional.
- Legacy AWS Terraform files remain in the repo only as decommissioning reference material.
- The legacy AWS app runtime has been decommissioned. Keep AWS usage limited to rollback/audit artifacts unless intentionally re-provisioning infrastructure.

### Current release strategy
- Keep preview deployments protected. `https://dev.mycarpal.app` aliases the preview branch, and generated preview URLs remain useful for protected diagnostics.
- Use `https://mycarpal.app` as the canonical public host and redirect `www` to the apex.
- Keep `NEXT_PUBLIC_ENABLE_SOCIAL_AUTH=0` on preview builds.
- Keep `NEXT_PUBLIC_ENABLE_APPLE_AUTH=0` on both preview and production until Apple is intentionally re-enabled.
- If protected generated URLs need automated testing, use Vercel's automation bypass secret rather than weakening deployment protection.
- Production `/api/health` checks require `Authorization: Bearer $HEALTHCHECK_SECRET`.

### Infrastructure docs (source of truth)
- Active deployment guidance lives in `README.md`.
- AWS-to-Vercel operator history and rollback notes live in `~/projects/personal/my-car-pal/docs/infrastructure/aws-to-vercel-cutover-runbook.md`.
- Legacy AWS decommissioning references remain in `~/projects/personal/my-car-pal/docs/infrastructure/` and `~/projects/personal/my-car-pal/infra/terraform/`.

## Data model expectations (high level)
Keep schema changes pragmatic and migration-safe. Core entities currently include:
- `User`, `Session`, `UserAlertState`, `ContactMessage`
- `Vehicle` (including `kind` and VIN/decode-derived metadata such as drivetrain)
- `Maintenance`, `Reminder` (including optional recurring frequency fields)
- `ServiceScheduleImport`, `ServiceScheduleOverride`
- `GloveboxDocument`
- `InsurancePolicy`, `InsurancePolicyVehicle`

## Implementation guardrails
- Preserve per-user data isolation on every new query/action.
- Do not add paid-plan gates or premium entitlement rules to the public core path without explicit product direction.
- Favor additive, reversible schema evolution.
- Keep form workflows fast and forgiving (sensible defaults, clear validation).
- Prefer explicit UI feedback for user actions (pending/success/no-op/error states).
- For external data integrations, keep cost low, behavior transparent, and privacy-safe.
- Next Home imagery milestone: build a vehicle image asset library/data store for transparent or vector-style vehicle photos keyed by year, make, model, trim, and body style. Until then, use `public/images/landing/vehicle-cutout-tacoma.png` as the dev/local placeholder and do not add schema in this pass.

## Security and privacy posture
- Keep privacy-forward messaging accurate and consistent.
- Avoid collecting data that is not needed for product value.
- Treat uploaded documents and profile assets as user data requiring strict ownership checks.

## Documentation policy
When product behavior changes:
- update `README.md` for route/features/status summaries
- append `CHANGELOG.md` with dated, user-facing change notes
- update this `Agents.md` when priorities or guardrails change

## Sources of truth
- Historical baseline: `v1.0.0-alpha` tag
- Current state and chronology: `CHANGELOG.md`
- Contributor quickstart and route/feature snapshot: `README.md`

<!-- VERCEL BEST PRACTICES START -->
## Best practices for developing on Vercel

These defaults are optimized for AI coding agents (and humans) working on apps that deploy to Vercel.

- Treat Vercel Functions as stateless + ephemeral (no durable RAM/FS, no background daemons), use Blob or marketplace integrations for preserving state
- Edge Functions (standalone) are deprecated; prefer Vercel Functions
- Don't start new projects on Vercel KV/Postgres (both discontinued); use Marketplace Redis/Postgres instead
- Store secrets in Vercel Env Variables; not in git or `NEXT_PUBLIC_*`
- Provision Marketplace native integrations with `vercel integration add` (CI/agent-friendly)
- Sync env + project settings with `vercel env pull` / `vercel pull` when you need local/offline parity
- Use `waitUntil` for post-response work; avoid the deprecated Function `context` parameter
- Set Function regions near your primary data source; avoid cross-region DB/service roundtrips
- Tune Fluid Compute knobs (e.g., `maxDuration`, memory/CPU) for long I/O-heavy calls (LLMs, APIs)
- Use Runtime Cache for fast **regional** caching + tag invalidation (don't treat it as global KV)
- Use Cron Jobs for schedules; cron runs in UTC and triggers your production URL via HTTP GET
- Use Vercel Blob for uploads/media; Use Edge Config for small, globally-read config
- If Enable Deployment Protection is enabled, use a bypass secret to directly access them
- Add OpenTelemetry via `@vercel/otel` on Node; don't expect OTEL support on the Edge runtime
- Enable Web Analytics + Speed Insights early
- Use AI Gateway for model routing, set AI_GATEWAY_API_KEY, using a model string (e.g. 'anthropic/claude-sonnet-4.6'), Gateway is already default in AI SDK
  needed. Always curl https://ai-gateway.vercel.sh/v1/models first; never trust model IDs from memory
- For durable agent loops or untrusted code: use Workflow (pause/resume/state) + Sandbox; use Vercel MCP for secure infra access
<!-- VERCEL BEST PRACTICES END -->
