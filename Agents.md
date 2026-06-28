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

## Current product baseline
- Authenticated, user-scoped experience (per-user vehicles, maintenance, docs, reminders, alerts).
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
  - uploaded docs with categories and per-user visibility
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
- Public-core default target: self-hosted Node/Docker with PostgreSQL and local file storage.
- Optional provider adapters should remain optional and clearly documented.
- Keep secrets out of git and out of `NEXT_PUBLIC_*` variables unless they are intentionally public browser configuration.
- CI/CD standard is GitHub Actions for app verification.
- Managed hosting, billing, customer operations, private domains, deployment protection, and provider-specific production configuration belong in the private managed-cloud track.

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
