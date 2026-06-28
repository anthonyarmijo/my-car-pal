# Open Source Restructure Readiness

This document is the planning source of truth for the first wave of the My Car Pal open-source restructure. The current goal is readiness and decomposition only. Do not move code into new repositories until the boundaries, checklist, and migration runbook are approved.

## Current Increment Status

Increment 2 is underway:

- README now leads with the public self-hostable core rather than private Vercel operations.
- Local storage can be used in Docker/production mode through `FILE_STORAGE_DRIVER=local`.
- Runtime vehicle and motorcycle access no longer depends on paid plan tiers in the core path.
- Disabled Stripe API stubs and the app-level prelaunch gate have been removed from the core runtime.
- `/api/health` now provides a generic core health response without private bearer secrets.
- Private launch-readiness runtime helpers were removed from `lib/`.
- Vercel env verification, prelaunch smoke, and AWS-to-Vercel cutover scripts were removed from `scripts/`.
- The unused AWS SDK dependency was removed after the cutover scripts left the public-core path.
- `scripts/smoke-security.mjs` now assumes a generic self-host target instead of Vercel deployment-protection headers.
- Public repo readiness scaffolding now exists in `CONTRIBUTING.md`, `SECURITY.md`, `SUPPORT.md`, and `.github/ISSUE_TEMPLATE/`.
- Docker self-hosting now uses host port `55432` by default to avoid common local Postgres conflicts, while the app container still talks to `postgres:5432`.
- Private managed-cloud ownership is documented in `docs/dev/private-cloud-boundary.md`.
- The repository split workflow is documented in `docs/dev/repository-split-runbook.md`.

Remaining blockers before a public repo push:

- ~~Decide the Stripe/subscription schema strategy.~~ Done. Stripe schema dropped via `20260524000100_drop_billing_schema`.
- ~~Choose a license.~~ AGPL-3.0 selected and `LICENSE` added.
- Remove, scrub, or exclude infrastructure docs, private launch planning, generated provider metadata, incident artifacts, `infra/`, and `terraform.legacy/`.
- Run a secret and history audit.
- Resolve the remaining npm audit advisory when Next/PostCSS publish a safe non-forced path; `npm audit fix --force` currently proposes a breaking downgrade to `next@9.3.3`.
- Verify a clean self-host flow from a fresh clone.

## Latest Verification

2026-05-24 public-core checks:

- `npm run build` passed. Existing warning: landing page uses `<img>` instead of `next/image`.
- `DATABASE_URL=postgresql://mycarpal:mycarpal_dev@localhost:55432/mycarpal?schema=public DIRECT_URL=postgresql://mycarpal:mycarpal_dev@localhost:55432/mycarpal?schema=public npm run test:security:isolation` passed.
- `POSTGRES_HOST_PORT=55432 docker compose build app` passed.
- `POSTGRES_HOST_PORT=55432 docker compose up -d app adminer` passed.
- `curl http://localhost:3000/api/health` returned `200` with `{"ok":true,"service":"my-car-pal-core"}`.
- `node scripts/smoke-security.mjs --base-url=http://localhost:3000` passed.
- `npm audit fix` was applied for non-forced runtime fixes. `npm audit --omit=dev` still reports the Next/PostCSS advisory; the offered forced fix is not acceptable because it would install `next@9.3.3`.

Local note: the host shell used Node `v26.0.0`, while the project declares Node `20.x`; Docker verification used the pinned Node 20 image.

## Target Topology

My Car Pal is expected to split into these long-term areas:

| Area | Visibility | Purpose | Initial posture |
| --- | --- | --- | --- |
| Core app | Public | Self-hostable owner-first vehicle maintenance command center | Open-source repo with app code, local auth, Postgres, Docker, and configurable storage |
| Cloud | Private | Managed customer data, production operations, premium services, and cloud sync | Private repo or package boundary with security-first ownership |
| Mac app | Private initially | Premium native Mac experience with liquid glass design | Planned after core/cloud boundaries are stable |
| iOS app | Private initially | Premium iPhone experience with liquid glass design | Planned after core/cloud boundaries are stable |

The public core should be useful on its own. It should not depend on private managed-cloud services to run locally or in a self-hosted environment.

## Public Core Default

The future open-source core should include:

- Owner-first garage, vehicle profile, maintenance, reminder, glovebox, DIY, alert, and local mechanic workflows.
- Local email/password auth and user-scoped data isolation.
- Postgres schema, Prisma migrations, and seed/dev tooling needed for a clean local install.
- Docker and Docker Compose paths for running the app and database together.
- Configurable storage defaults, with local file storage available for self-hosting and adapter points for managed storage.
- Privacy-forward public pages and product documentation that are safe to publish.
- Tests or smoke checks that prove user isolation and basic route health in a self-hostable setup.

The public core should avoid hard dependencies on Vercel, Neon, Vercel Blob, Stripe, or private production domains. Those providers can be supported through documented adapters or optional configuration where that does not expose private business logic.

## Private Cloud Exclusions

The private cloud area should retain or own:

- Stripe billing routes, subscription sync, customer portal behavior, webhook handling, and premium entitlement rules.
- Managed-cloud sync, customer data operations, production support workflows, and business planning.
- Production Vercel, Neon, Vercel Blob, Cloudflare, deployment protection, bypass secret, and incident-response details.
- Private roadmap, pricing experiments, cost models, and launch operations.
- Any customer-specific data, logs, credentials, generated environment files, or deployment artifacts.
- Security-sensitive infrastructure and rollback/audit material that is useful internally but not appropriate for a public repo.

Where the public core needs similar behavior, prefer small interfaces or explicit adapters rather than copying private-cloud implementation details into public code.

## Boundary Categories

Use these categories for every route, module, script, and doc before extraction:

| Category | Meaning | Public repo posture |
| --- | --- | --- |
| Public core | Safe and useful in a self-hosted app | Move or keep in the future public core with normal review |
| Adapter-backed | Core needs the capability, but provider details should be swappable | Keep an interface in core; move managed-provider implementation behind config or private/cloud code |
| Private cloud | Business, managed-service, customer-data, or production-only logic | Keep private unless rewritten as generic public guidance |
| Legacy/audit | Historical rollback, cutover, or decommissioning material | Keep private by default; publish only sanitized summaries if needed |
| Needs decision | Product or legal choice is not settled | Block public extraction until the linked issue resolves it |

## Route And Module Boundary Map

| Area | Boundary | Self-host posture | Next issue |
| --- | --- | --- | --- |
| Public landing, auth, legal, about, contact, DIY pages | Public core | Can remain with privacy-forward copy after public-doc review | `ANT-6` |
| Signed-in app pages for Home, Garage, Maintenance, Vehicle, Glovebox, Profile | Public core with adapter-backed exceptions | Core product flows should remain self-hostable; file URLs and plan messaging need adapter review | `ANT-7` |
| Vehicle catalog, VIN decode, maintenance schedules, DIY content, alerts, date helpers | Public core | Valuable domain logic for self-hosters; keep provider calls transparent and low-cost | `ANT-7` |
| Better Auth email/password session foundation | Public core | Keep local auth and per-user isolation; social providers must be optional | `ANT-6` |
| Google and Apple auth provider config | Adapter-backed | Core can expose optional provider setup; managed callback/domain specifics stay private | `ANT-9` |
| File upload, signed URL, ownership checks, and document proxy | Adapter-backed | Core keeps ownership checks and local storage default; Vercel Blob details become optional provider wiring | `ANT-8` / `ANT-9` |
| Billing panel, plan tiers, free-tier gates, subscription schema, Stripe routes | Needs decision leaning private cloud | Runtime gates/routes are removed from core; inert schema remains until the owner approves drop/retain/adapter strategy | `ANT-9` |
| Launch access gate, launch readiness checks, protected preview behavior, live-domain auth guidance | Private cloud | Runtime gate and private scripts are removed from core; historical docs remain excluded pending scrub | `ANT-9` / `ANT-11` |
| Health endpoint and security smoke checks | Adapter-backed | Core can keep generic health/security checks; secret-gated production behavior needs self-host docs | `ANT-8` |
| Local mechanic lookup | Public core | Keep non-sponsored messaging and rate limits; document external OpenStreetMap behavior | `ANT-7` |
| Vercel env verification and cutover scripts | Private cloud or legacy/audit | Keep private unless rewritten as generic self-host checks | `ANT-11` |
| AWS/Terraform/decommissioning docs and incident artifacts | Legacy/audit | Do not publish raw history without scrub and explicit approval | `ANT-10` / `ANT-11` |
| Mac and iOS app plans | Mobile/future | Block native work on stable public core/private cloud API boundaries | `ANT-12` |

## Implementation Inventory

| Path or area | Likely category | Notes |
| --- | --- | --- |
| `app/` | Public core with adapter-backed exceptions | Medium risk. Product pages are public core. Stripe API routes and launch access are removed. File proxy provider details and provider callback assumptions still need adapter review. Public readiness: improved. Next: `ANT-6`, `ANT-9`. |
| `components/` | Public core with review | Low risk. Most components are publishable UI. Billing panel and plan-limit copy need a business-logic review. Public readiness: mostly ready. Next: `ANT-7`, `ANT-9`. |
| `lib/` | Mixed | High risk. Domain helpers are core. Billing, storage provider wiring, launch readiness, auth origins, and rate-limit policy are boundary-sensitive. Public readiness: partial. Next: `ANT-6`, `ANT-7`, `ANT-9`. |
| `prisma/` | Public core | Low risk. Billing schema dropped via `20260524000100_drop_billing_schema`. Core schema and migrations are clean for self-hosting. Public readiness: ready. Next: `ANT-8`. |
| `scripts/` | Public core | Low risk. Remaining scripts are local dev/reset, catalog sync, self-host security smoke, and isolation checks. Vercel env verification, prelaunch smoke, and AWS-to-Vercel cutover scripts have been removed from the core path. Public readiness: mostly ready. Next: `ANT-8`. |
| `docs/dev/` | Public core planning with review | Low risk. Planning docs are safe if they avoid secrets and private roadmap details. Public readiness: mostly ready. Next: `ANT-10`. |
| `docs/infrastructure/` | Private cloud or legacy/audit | High risk. Contains Vercel launch guidance, incident artifacts, AWS rollback history, and operational details. Public readiness: blocked pending scrub. Next: `ANT-10`, `ANT-11`. |
| `infra/` and `terraform.legacy/` | Legacy/audit | High risk. Kept for decommissioning reference, not self-host distribution. Public readiness: blocked pending scrub and explicit approval. Next: `ANT-11`. |
| `.github/` | Adapter-backed CI | Low to medium risk. Existing CI uses static local env defaults and can likely be public after provider/deployment review. Public readiness: partial. Next: `ANT-10`. |
| `Dockerfile` | Public core with self-host polish | Medium risk. Useful for self-hosting but currently production-oriented and migration-on-start behavior needs documentation. Public readiness: partial. Next: `ANT-8`. |
| `docker-compose.yml` | Public core with managed-provider cleanup | Medium risk. Good self-host basis with Postgres and app service. Managed storage/provider env wiring needs optional/adapted framing. Public readiness: partial. Next: `ANT-8`. |
| `README.md`, `CHANGELOG.md`, `Agents.md` | Mixed | Medium risk. README and changelog need public self-host framing; contributor guardrails may stay private or be rewritten. Public readiness: partial. Next: `ANT-10`. |
| `package.json` and lockfile | Public core | Low risk. Scripts support core self-hosting and verification. Unused AWS SDK dependency was removed with private cutover scripts. Public readiness: mostly ready. Next: `ANT-8`, `ANT-10`. |

## Immediate Code Posture

No code should move in this tranche. The implementation map above says what can remain unchanged for self-hosting and what needs a future boundary:

- Can remain largely unchanged for public core: vehicle domain helpers, maintenance schedules, DIY content, core authenticated pages, ownership checks, local development scripts, Prisma base schema, Docker/Postgres development flow.
- Needs adapter work before public extraction: storage provider behavior, health/readiness checks, social auth provider config, rate-limit defaults, local mechanic external calls, CI/deployment environment assumptions.
- Needs private/cloud split or explicit product decision: inert Stripe subscription fields/migrations, Vercel/Neon/Blob operational docs, incident artifacts, infrastructure history, private launch planning, native app roadmap details.
- Blocks public repo creation: license choice, secret/history scrub plan, split migration runbook, public support policy, and final decision on billing schema exposure.

## First Milestone Checklist

Linear project: `open source initiative (app restructure)`

Milestone: `My Car Pal split into 2 functional repositories`

- `ANT-5` Kick off open-source restructure readiness.
- `ANT-6` Define public core vs private cloud boundaries.
- `ANT-7` Inventory current repo by extraction category.
- `ANT-8` Design the self-host distribution path.
- `ANT-9` Plan managed-cloud isolation points.
- `ANT-10` Draft public repo readiness checklist.
- `ANT-11` Write repository split migration runbook.
- `ANT-12` Clarify Mac and iOS project dependency on core split.

## Public Repo Readiness Checklist

Before creating or opening the public core repository:

- Pick and document a license.
- Finalize `SECURITY.md`, `CONTRIBUTING.md`, issue templates, and the public support policy. Initial placeholders are present.
- Run a secrets/history audit and remove private generated artifacts before publishing.
- Decide whether billing/subscription schema stays in core, moves private, or becomes adapter-backed.
- Replace private production deployment notes with generic self-host and optional managed-provider docs.
- Confirm CI can run without private secrets.
- Confirm self-host startup works from a clean checkout with documented environment variables.
- Review all docs and screenshots for private URLs, customer data, credentials, and internal roadmap details.

## Migration Runbook Outline

The split runbook should decide:

- Target repository names and visibility.
- Git history strategy, including whether to preserve full history or use a filtered import.
- Branch flow from current `dev` and `main` into public core and private cloud repos.
- Package/app boundary strategy if an interim monorepo phase is needed.
- Secret and artifact scrubbing process before any public push.
- CI expectations for both repositories.
- Verification checklist for local self-hosting, managed preview, and production.
- Rollback plan if the extraction blocks launch-critical work.

## Open Decisions

- Which license best matches the product and commercial goals.
- Whether subscription models remain in the public schema as inert self-host data or move behind a private/cloud adapter.
- Whether Vercel Blob support appears in public core as an optional adapter or only in private cloud.
- Whether the public repo doubles as the primary branding page or links to a separate marketing site.
- How much historical infrastructure documentation should remain private-only.
