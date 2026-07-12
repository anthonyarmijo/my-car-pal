# Changelog

## 2026-07-12
- Refined the landing page into a clearer premium product story while preserving
  the cinematic highway-to-garage experience: visitors now see concise product
  positioning, Start free and See the product actions, and verified free/no-card/
  ad-free/self-hostable proof in the first viewport.
- Replaced the six equal feature cards with three outcome-led product stories,
  strengthened the dashboard capability summary, and added an explicit choice
  between My Car Pal Cloud and the free self-hosted open core.
- Added intentional GitHub actions to desktop/mobile navigation, the privacy and
  ownership section, the closing CTA, and the footer; the responsive marketing
  menu now supports keyboard focus, Escape, and outside-click dismissal.
- Added a visually matched 1080p VP9 source for the full highway film, reducing
  preferred-source transfer size by about 28% while retaining the original MP4
  fallback; reduced-motion and Save-Data visitors now stay on the poster.
- Restored the forest-highway film's original color and upgraded the landing
  asset and reduced-motion poster from a fresh 1080p source download, replacing
  the earlier 720p-derived warm grade with neutral handoff shading and a subtle,
  hue-preserving saturation and contrast lift plus a faint green-biased canopy
  treatment that gives the trees more presence without an aggressive grade.
- Tightened the landing dashboard sample into a shorter, more focused preview,
  kept its compact navigation visible at tablet widths, added sage and cool-stone
  surface variation, and grounded the Subaru on a subtle simulated floor plane.
- Added a privacy-themed scroll reveal that clears a scrambled pixel mosaic and
  sharpens the ownership commitments as the section enters view, while honoring
  reduced-motion preferences.

## 2026-07-10
- Updated the landing dashboard preview with an Autumn Green Subaru Outback
  Wilderness photo cutout, including a lightweight transparent WebP and
  source attribution.
- Refreshed the landing dashboard preview around the new owner-command-center
  concept: it now shows a quieter garage sidebar, saved-state top bar, Outback
  vehicle card, complete upcoming list, concise health summary, and recent
  activity in both light and dark themes.
- Replaced the preview vehicle with a local transparent Autumn Green 2023
  Subaru Outback Wilderness cutout. The credited CC BY-SA source and the
  background-removal modification are recorded with the landing assets.
- Added a dashboard mockup mapping document for the later authenticated-page
  redesign; the real Home, Garage, Maintenance, Glovebox, DIY, and Profile
  routes remain unchanged in this pass.
- Moved the Start free / See how it works buttons and the proof points from
  the garage scene to sit centered under the dashboard preview, leaving the
  garage copy as a quiet headline; "See how it works" now scrolls to the
  features section.
- Fixed the highway video's sticky pin (a shell `overflow: hidden` was
  disabling it), so the garage scene now genuinely crossfades over the
  still-playing footage instead of leaving a blank band after the video.
- Added a scroll-driven color journey to the handoff: the footage grades
  toward warm dusk as you scroll and a soft garage-light glow blooms along
  the crossfade seam (lamplight amber at night); the loop also pauses
  automatically once scrolled out of view.
- Added a sticky, scroll-driven highway handoff that gently zooms and dims the
  footage before the garage rises through the crossfade.
- Replaced the landing hero's rigid separator with a short overlapping image
  crossfade, subtly cooled and textured the daytime garage photography, and
  removed the redundant "Your digital garage" eyebrow.
- Refined the night landing experience with more neutral garage lighting, a
  softer highway-to-garage fade, a greyer dashboard palette, and a slight
  dark-mode video exposure lift.
- Shortened the original linear highway-to-garage fade so it retains its
  stronger finish without reaching as far up the video while scrolling.

## 2026-07-09
- Fixed dark-mode landing rendering so the dashboard preview keeps its complete
  layout and all feature, privacy, closing CTA, and footer content remain
  visible.
- Updated the landing header actions to use matching translucent dark-mode
  treatment.
- Added a complete dark palette to the landing dashboard/browser preview and
  adjusted the highway video exposure separately for light and dark themes.
- Replaced the flat blue dark-mode garage overlay with a dedicated
  photographic night-garage scene and warm, realistic outdoor lighting.
- Restructured the landing opener: the highway film (restored from the
  pre-redesign hero, re-encoded and warm-graded) now fills the first viewport
  edge-to-edge with the tagline and a scroll-cue arrow, under a transparent
  Porsche-style header with a centered logo, white nav links, and transparent
  Log In / outlined Start Free actions.
- Made the garage scene intentionally vehicle-free with the "Your digital
  garage" copy centered over the clean floor; the composited vehicle cutout now
  appears only in the dashboard preview and the signed-in Home page.
- Rebuilt the dashboard preview as a realistic neutral-gray browser mockup
  (tab strip, toolbar, padlocked address bar) around a product shell with left
  sidebar navigation, greeting bar, Upcoming list, stats, and health/activity
  panels.
- Replaced the three-way theme selector on the landing header with a single
  system-default sun/moon icon toggle.
- Landing polish pass: moss-green line icons on feature cards, a site footer
  with product/company/trust links, a compact single-row mobile header, a
  responsive hero image with high fetch priority, and "Built for owners, not
  dealerships." under the feature grid.

## 2026-07-08
- Adopted the "Warm Scandinavian Garage" visual direction across the landing
  page and app shell: warm off-white/cream surfaces, moss/forest green accents,
  warm graphite text, and a light top nav replacing the graphite/terracotta
  Desert Graphite treatment (`docs/design/warm-scandinavian-garage.md`).
- Rebuilt the landing page as a full-viewport sunlit-garage hero ("Take care of
  your car. We'll handle the rest.") with pointer parallax, floating proof
  cards, a scroll-in dashboard reveal, concise feature/privacy sections, and a
  forest-green closing CTA; removed the old video hero, photo showcase, and
  trust bar and ~3,500 lines of dead landing CSS.
- Standardized the vehicle-image treatment as a foreground cutout on a reusable
  stage plane with a synthetic shadow (landing hero, dashboard reveal, and Home
  primary-vehicle card) so future make/model assets can be swapped in without
  scene changes.
- Updated `@my-car-pal/ui` tokens: new `moss.600`/`forest.700` primitives now
  back `action.primary`/`action.primary.strong`; tobacco primitives retained
  for compatibility.
- All landing motion honors `prefers-reduced-motion`, and sections use
  labelled landmarks with decorative imagery hidden from assistive tech.

## 2026-06-28
- Expanded design-system adoption across authenticated Home, Garage,
  Maintenance, and Glovebox shell cards/actions using `@my-car-pal/ui` while
  preserving server actions, auth redirects, data ownership checks, and legacy
  layout classes.
- Migrated remaining low-risk Garage, Glovebox, Maintenance, odometer, profile
  avatar, and email-preference buttons/cards to package primitives, then removed
  the now-unused `components/ui/button.tsx` and `components/ui/card.tsx`
  adapters.
- Added `npm run test:design-system:rendered`, a Playwright production-server
  smoke that checks desktop/mobile public routes, protected redirects, safe
  field interactions, package marker classes, framework overlays, console/page
  errors, and optional authenticated route renders.
- Expanded Storybook with app-realistic composition stories for authenticated
  page headers, Garage empty state, Maintenance feedback, Glovebox status, and
  alert/callout variants, and added them to visual smoke coverage.
- Recommended CI screenshot artifacts as the current visual baseline strategy,
  deferring checked-in snapshots and hosted visual vendors until baseline
  ownership and review thresholds are explicit.
- Completed rendered desktop/mobile QA for the design-system migration routes
  (`/`, `/login`, `/register`, and `/profile` redirect) using the documented
  Playwright fallback after the in-app Browser runtime was unavailable.
- Fixed migrated login form spacing so the social-login unavailable message no
  longer crowds the first field label on desktop or mobile.

## 2026-06-21
- Added a structured Desert Graphite token manifest and JSON snapshot for
  `@my-car-pal/ui`, with CSS-variable mapping for future Tailwind/shadcn and
  `/design-sync` work.
- Added `npm run check:ui-tokens` and a package `tokens:write` workflow so the
  generated token JSON snapshot stays synchronized with the TypeScript token
  source.
- Added a Playwright-based Storybook visual smoke workflow that checks key
  design-system stories across desktop and mobile viewports.
- Added a static Storybook auth-entry composition story and visual-smoke
  coverage so migrated route-level form assembly is reviewed alongside
  primitive examples.
- Migrated the login and register onboarding form controls/buttons/messages to
  `@my-car-pal/ui` primitives while preserving app-owned auth behavior.
- Migrated the auth-error recovery page cards, badges, error feedback, and
  app-owned recovery link styling to `@my-car-pal/ui` primitives/helpers.
- Migrated static About, Privacy, and Terms page wrappers/badges to
  `@my-car-pal/ui` primitives while preserving page-specific classes and copy.
- Migrated Home dashboard badges to package `Badge` while preserving the legacy
  `badge` class during visual transition and keeping alert/vehicle/dashboard
  behavior app-owned.
- Migrated contact page wrappers/form controls and profile email-preference
  feedback/actions to `@my-car-pal/ui` primitives while keeping server actions
  and feature logic app-owned.
- Migrated the profile account form card, labels, inputs, textarea, save action,
  and saved feedback to `@my-car-pal/ui` primitives without changing account
  data, avatar, or billing behavior.
- Migrated pricing plan card wrappers to `@my-car-pal/ui` cards while keeping
  Stripe price IDs, checkout behavior, disabled states, and CTA styling in app
  code.
- Migrated Garage, Maintenance, and Glovebox first-run empty states to the
  package `EmptyState` primitive while keeping their data queries and feature
  workflows app-owned.
- Migrated maintenance add-service, schedule/import, and service-edit
  submit/feedback UI to package `Button` and `FormMessage` primitives while
  keeping server actions, field markup, reset effects, and schedule logic
  app-owned.
- Migrated Glovebox document upload, registration, and insurance policy
  feedback to package `FormMessage` while keeping upload actions, registration
  archive rendering, policy state, app-local fields, and file inputs app-owned.
- Migrated reminder and profile-avatar feedback to package `FormMessage` while
  preserving reminder reset behavior, avatar auto-submit, and router refresh
  behavior in app code.
- Added `FormMessage as="div"` support to `@my-car-pal/ui`, migrated the
  add-vehicle VIN-decode and nested follow-up feedback to the package
  primitive, and removed the app-local `FormMessage` wrapper.
- Documented the remaining `components/ui` files as transition adapters for
  legacy app classes, with migration conditions to avoid accidental visual
  churn while app surfaces move onto package primitives.
- Migrated vehicle profile form submit and registration replacement feedback
  actions to package `Button` and `FormMessage` primitives while preserving
  hidden inputs, server-action `name`/`value` semantics, file upload controls,
  and local toggle state.
- Added an npm `files` allowlist for `@my-car-pal/ui` so dry-run package
  audits include runtime source, styles, tokens, and docs without Storybook
  fixtures or internal verification scripts.
- Added `npm run check:ui-pack` to enforce the UI package dry-run tarball shape
  and keep internal fixtures, scripts, generated output, and env files out of a
  future package artifact.
- Added `npm run verify:design-system` as the one-command gate for token sync,
  package boundary, package tarball audit, type checks, lint, production build,
  route smoke for migrated app surfaces, and Storybook visual smoke.
- Added `npm run test:design-system:routes` to smoke migrated public/auth
  routes against `next start`, checking package markers and protected-route
  redirect behavior without requiring browser access.
- Added pricing-page coverage to the design-system route smoke so migrated plan
  cards are checked alongside auth, static, and protected-route surfaces.
- Expanded protected-route smoke coverage for Garage, Maintenance, and Glovebox
  redirects while those authenticated surfaces move onto package primitives.
- Added Home redirect coverage to the design-system route smoke while Home
  dashboard badges move onto package primitives.
- Added vehicle-detail redirect coverage to the design-system route smoke while
  vehicle profile form controls move onto package primitives.
- Added explicit design-system migration notes and a Claude `/design-sync`
  readiness checklist for future adoption work.
- Added a design-system verification audit that maps each goal requirement to
  current evidence and calls out the remaining in-browser localhost QA blocker.
- Updated CI app checks to run the full design-system verification gate,
  including Playwright-backed Storybook smoke coverage.
- Added the first standalone `@my-car-pal/ui` design-system package boundary
  with Desert Graphite tokens, presentational Button/Card/Badge/form/feedback
  primitives, and Storybook examples.
- Documented what belongs in the design system versus app components, the
  incremental migration path, shadcn/Tailwind readiness, and remaining Claude
  `/design-sync` blockers.

## 2026-06-14
- Rewarmed the auth/public app shell so `/login`, `/register`, auth-error,
  and shared non-landing surfaces use the current earth-tone palette instead
  of the older cool blue/green theme.
- Warmed remaining landing CTA and dashboard-preview accent treatments while
  preserving sage/green only for positive status states.
- Softened auth page label banners from copper-red to neutral sand/taupe so
  they read as labels rather than error or warning states.

## 2026-05-31
- Added the first default vehicle image catalog foundation with a separate
  `DefaultVehicleImage` table, reviewed manifest import workflow, normalized
  image matching, and owned generic car/motorcycle fallback assets.
- Updated Home and Garage vehicle rendering so uploaded photos still win while
  vehicles without uploads can use matched catalog defaults instead of storing
  placeholder art on each vehicle record.
- Added a repeatable Wikimedia Commons review workflow for default vehicle
  images, stricter import validation for reviewed source/author/license/year
  metadata, local attribution notes, and a first batch of nine reviewed
  catalog assets for popular U.S. vehicles.

## 2026-05-29
- Implemented the selected Desert Graphite authenticated Home direction with a graphite top nav, porcelain dashboard surfaces, copper primary actions, a large primary vehicle panel using the Tacoma cutout fallback, compact setup checklist, alerts, quick odometer controls, overview cards, and bottom pro-tip action strip.
- Added a Home greeting weather badge that uses device location when available and approximate location fallback for current local temperature.
- Switched the app interface font to Geist and documented the next vehicle image asset-library milestone keyed by year/make/model/trim/body style.
- Replaced the post-signup auto-redirect with a welcome window and a clear
  "Take me to my garage" button into the Garage add-vehicle flow.
- Refreshed the signed-in app shell and Home dashboard with cooler slate/white
  surfaces, softer green trust accents, cleaner cards, and a primary vehicle
  summary module.
- Refreshed managed-cloud documentation for the canonical Vercel project,
  split preview/production Neon projects, exact migration database guards,
  authenticated production health checks, and current private-cloud boundary.
## 2026-05-28
- Split managed preview and production onto separate Neon projects, reset both
  clean `mycarpal` databases from Prisma migrations, and tightened GitHub
  migration guards to exact pooled/direct Neon hosts.
- Pinned GitHub deploy workflows to the canonical Vercel project so the
  private repo cannot accidentally deploy to the stale similarly named Vercel
  project.
- Updated the production deploy health check to authenticate with the same
  `HEALTHCHECK_SECRET` used by the deployed app.

## 2026-05-24 (continued)
- Chose AGPL-3.0 as the open-source license and added `LICENSE` to the repository root.
- Decided to drop the inert Stripe/subscription schema from the public core (`User.planTier`, `User.stripeCustomerId`, `Subscription` table, `PlanTier`, and `SubscriptionStatus` enums) via a destructive migration. Runtime billing code was already removed; the schema removal clears the last database-level billing artifacts from the public-core path.
- Ran a Level 1 working-tree secret scan with gitleaks (29 findings, all in gitignored files). No leaks in pushable content.
- Verified `npm run build` after schema changes.

## 2026-05-24
- Started the open-source restructure readiness track with a repo-owned planning doc and a Linear milestone issue tree for the public core/private cloud split.
- Shifted the default app posture toward the public self-hosted core: local file storage now works in Docker/production mode, runtime vehicle access no longer depends on paid-plan gates, disabled Stripe/prelaunch/launch-readiness runtime stubs were removed from the core app, Docker builds no longer require private env, and public/private split runbooks document what stays in the managed-cloud layer.
- Removed private cutover/prelaunch/Vercel verification scripts from the core script tree, dropped the now-unused AWS SDK dependency, converted the remaining security smoke helper to self-host assumptions, added public contributor/security/support scaffolding and issue templates, and documented that Stripe schema removal remains blocked on an explicit owner migration decision.
- Applied the safe `npm audit fix` path, which updated runtime dependency locks including Better Auth while leaving the remaining Next/PostCSS advisory blocked on an unsafe forced downgrade suggestion.
- Verified the public-core path with `npm run build`, the user-isolation security test, Docker app image build, Docker app/Adminer startup, `/api/health`, and the self-host security smoke helper.

## 2026-05-22
- Added a global System/Light/Dark theme toggle with a soft charcoal dark theme across public, auth, and signed-in app surfaces.

## 2026-05-21
- Simplified the public landing header by removing the top-level Pricing link while keeping the free-start CTA prominent.
- Extended the landing page with a privacy promise strip, compact FAQ, and warmer final CTA focused on the free one-vehicle starting point.

## 2026-05-16
- Shifted the latest design pass back toward the original calm mockup with a lighter dashboard sidebar, softer green accents, airier landing spacing, and a lighter outlined brand mark.
- Matured the product visual language toward a more polished owner-command-center feel, including a simplified brand mark, sharper landing hierarchy, calmer app shell, flatter controls, and more restrained shared UI surfaces.
- Added subtle landing-page motion and swapped the dashboard preview's CSS car drawing for a locally served 2020 Toyota Camry LE placeholder photo for the dev preview.
- Rolled the calm product-led visual system from the refreshed landing/auth experience into the signed-in shell, dashboard overview, navigation, shared cards, forms, status rows, and document/workflow surfaces.
- Removed the old road/gutter decorative shell chrome so the app now presents a quieter, privacy-forward workspace across public and signed-in routes.

## 2026-04-22
- Rotated the shared Neon database password used by preview and production, rotated preview/production `BETTER_AUTH_SECRET`, rotated the preview launch-access password, and redeployed both environments onto the new secrets after Vercel's April 2026 incident notice.
- Replaced the private Blob store with a fresh connected store, removed the two unused empty predecessor stores, and restored explicit `BLOB_STORE_ID` wiring for the app's private file proxy flow.
- Tightened `npm run vercel:env:verify` so it now enforces Vercel `sensitive` storage for launch-critical secrets and understands that `vercel env pull` redacts sensitive values instead of returning them.
- Refreshed the README and Vercel readiness docs with the required-sensitive env policy, the `vercel curl` protected-preview verification path, and the session invalidation behavior that follows `BETTER_AUTH_SECRET` rotation.

## 2026-04-21
- Switched deployed uploads back onto explicit private Vercel Blob access after confirming the linked production store is private, and tightened server-side file validation to PDF/JPEG/PNG/WebP with signature sniffing instead of broad `image/*` acceptance.
- Added stored-file cleanup on replacement and delete flows for garage photos, profile avatars, receipts, glovebox documents, insurance docs, and non-archived registration documents.
- Secret-gated `/api/health` behind `Authorization: Bearer $HEALTHCHECK_SECRET`, updated launch-readiness/env verification checks, and refreshed the smoke tooling/docs to use the new secret.
- Added global browser hardening headers (`X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, `Cross-Origin-Opener-Policy`) and a report-only Content Security Policy baseline.
- Added `npm run smoke:security` for anonymous live-route checks and `npm run test:security:isolation` for DB-backed ownership regression coverage.

## 2026-04-20
- Fixed the app-level prelaunch gate so `/privacy` and `/terms` stay public while other public pages can still remain behind the shared password during protected rollout windows.
- Added `--protection-bypass` / `VERCEL_AUTOMATION_BYPASS_SECRET` support to `npm run smoke:prelaunch` so protected Vercel deployment URLs can be tested without mistaking Deployment Protection for an app failure.
- Added canonical `www.mycarpal.app` to apex redirect handling in middleware.
- Attached `mycarpal.app` and `www.mycarpal.app` to the Vercel project, published the matching Cloudflare DNS A records, and moved production Better Auth URLs to `https://mycarpal.app`.
- Updated launch readiness checks so public production no longer reports a degraded state when the app-level prelaunch password is intentionally removed.
- Removed the temporary Apple query-callback provider workaround after confirming Apple requires `response_mode=form_post` whenever `name` or `email` scope is requested.
- Added `NEXT_PUBLIC_ENABLE_APPLE_AUTH` so Google can remain available during protected prelaunch while Apple stays hidden until the auth URLs move to `https://mycarpal.app`.
- Updated launch-readiness checks, Vercel env verification, and prelaunch docs so “Google on, Apple intentionally deferred” is treated as the expected protected-production state.

## 2026-04-19
- Added a public `/api/health` readiness endpoint and excluded it from the prelaunch gate so deployment checks can run without the shared access password.
- Added `npm run vercel:env:verify` to pull preview + production Vercel envs into temp files and audit launch-critical config such as auth URLs, remote Postgres, Blob storage, and preview social-auth gating.
- Added `npm run smoke:prelaunch` to smoke-test deployment health, public legal routes, and unauthenticated redirects through `/launch-access`.
- Added a dedicated Vercel prelaunch readiness doc and refreshed README / pre-launch task tracker guidance to reflect the current protected-preview strategy.
- Added database-backed per-IP credential auth rate limiting for login and signup, hashing IP identifiers with `BETTER_AUTH_SECRET` and leaving OAuth flows unchanged.
- Added public `/.well-known` bypass support for provider verification assets and documented the staged Google/Apple launch rollout, including the required callback URLs and production env expectations.
- Expanded Better Auth trusted origins to include the exact Vercel runtime hosts exposed for each deployment so prelaunch Google/Apple testing works on generated production deployment URLs as well as the stable production alias.
- Hardened production auth by resolving middleware session checks against the current request origin on Vercel, adding targeted OAuth state-cookie overrides for production social callbacks, and returning failed social sign-ins to `/login` or `/register` with readable error copy instead of `/?error=UNKNOWN`.
- Added an app-owned `/auth-error` fallback page for auth callback errors.

## 2026-04-18
- Added `Vehicle.kind` with `CAR`/`MOTORCYCLE`, defaulted existing vehicles to `CAR`, and threaded kind-aware behavior through garage, VIN decode, and maintenance schedule flows.
- Added curated motorcycle schedule support for Honda, Harley-Davidson, Kawasaki, Yamaha, Suzuki, Vespa, and Piaggio using normalized owner-manual intervals with source attribution and manual-reminder fallback for unsupported bikes.
- Rewrote `README.md` into a slimmer current-state guide, removed dated status snapshots, and added a repo-owned banner graphic.

## 2026-04-17
- Added a shared activation checklist derived from existing user data and surfaced it across Home, Garage, Maintenance, and Glovebox so first-run setup feels guided instead of page-by-page.
- Updated the Garage add-vehicle flow to return the next recommended setup step after success, and aligned the Garage UI allowance check with the existing plan-based server enforcement.
- Added welcome-state handoff from signup into Home setup guidance and tightened first-run empty states around mileage, reminders, service history, and registration/insurance setup.
- Restored the `dev` branch UI to the playful `main`-style theme, including the original landing/auth presentation, shared shell styling, and the guided `/register` onboarding flow with its welcome-state transition.
- Restored Better Auth client/runtime signup behavior to the pre-refresh flow, including dynamic client base-URL fallback and the stateful signup action contract used by the onboarding UI.
- Added `/privacy` and `/terms` pages for prelaunch/legal readiness.
- Added an app-level `/launch-access` gate backed by `PRELAUNCH_ACCESS_PASSWORD` so the production `my-car-pal.vercel.app` alias no longer serves the app anonymously on the Hobby plan.
- Updated the Vercel project Node runtime from `24.x` to `20.x` and deployed a new production build with the gate in place.
- Fixed the local build blocker in `lib/storage.ts` caused by the installed `@vercel/blob` SDK rejecting the older `access: "private"` literal.

## 2026-04-12
- Decommissioned the legacy AWS dev runtime to stop recurring AWS spend after confirming Vercel preview/dev and production environments use Neon Postgres and Vercel Blob instead of AWS RDS/S3.
- Deleted the AWS ALB, target group, ECS service/cluster, ECR repository, empty uploads bucket, Secrets Manager app secrets, CloudWatch log groups, ECS IAM roles, ACM certificates, DB subnet group, and project VPC/network resources in `us-west-1`.
- Retained only the final rollback snapshot `mycarpal-dev-postgres-final-20260412` and the tiny Terraform state bucket `mycarpal-terraform-state`.

## 2026-03-29
- Added an AWS-to-Vercel cutover toolkit under `scripts/cutover/` for Docker-backed database export/restore, row-count comparison, file-reference inventory, and legacy file migration into private Vercel Blob storage.
- Added an operator runbook for the remaining cutover work, including the discovered AWS source resources, current Vercel project state, Neon handoff steps, rollback timing, and verification flow.
- Pinned the repo to Node `20.x` via `package.json` engines and `.nvmrc` to align local development, CI, and the intended Vercel runtime baseline.
- Removed the last tracked `terraform.legacy/` leftover so AWS legacy material now lives only in `infra/terraform/` and `docs/infrastructure/`.
- Merged the refreshed design-language update into `dev`, bringing the public/app shell split, redesigned marketing/auth pages, and calmer signed-in workspace styling onto the protected preview branch.

## 2026-03-28
- Deleted the stale `codex/continue-previous-task-execution` remote branch and kept `dev` as the active continuation branch.
- Retired the ECS deployment workflow and narrowed CI to the active app path (`db:generate`, `lint`, `build`).
- Simplified runtime file storage to Vercel Blob for deployed environments with a local `/uploads` fallback during development.
- Switched deployed uploads over to private Vercel Blob serving with an authenticated `/api/files` proxy and ownership checks for profile, garage, maintenance, and glovebox files.
- Removed AWS Secrets Manager assumptions from the default Docker/local workflow.
- Deferred Stripe billing for pre-launch by making billing routes return a graceful unavailable response and reducing the profile billing area to read-only plan info.
- Updated README and AGENTS guidance to reflect Vercel + Neon Postgres + Vercel Blob as the active deployment baseline, with AWS docs retained only for decommissioning reference.

## 2026-03-27
- Added Stripe billing foundation: Prisma `PlanTier` + `SubscriptionStatus` enums, `User.planTier`, `User.stripeCustomerId`, and new `Subscription` model with migration.
- Added Stripe API routes for checkout, customer portal, and webhook sync (`/api/stripe/checkout`, `/api/stripe/portal`, `/api/stripe/webhook`).
- Migrated shared storage helpers toward Vercel Blob with locator support (`blob:<pathname>`) and legacy compatibility reads for `/uploads/...` and S3 keys.
- Improved app shell/navigation UX: server-driven header avatar, skip-link support, and simplified greeting rendering without client effect-derived state.
- Added in-app profile billing panel with upgrade/manage actions connected to Stripe routes.

This changelog is generated from the repository commit history on main.
Source used: git log --date=short --pretty=format:"%H %ad %s" --name-status.

## 2026-03-27 (Unreleased local changes)

### Vercel Re-baseline
- Reverted the mistaken PR #6 merge from `main` using a normal revert commit, keeping branch history intact while restoring the older main baseline.
- Resolved the local merge-marker breakage in the Vercel migration files and restored a clean `npm run build` + `npm run lint` path on `dev`.
- Linked the local checkout to the existing Vercel project and confirmed `main` as the Vercel production branch.
- Added `.vercelignore` so local preview deploys stop uploading `node_modules`, `.next`, Terraform state, and other oversized local-only files.
- Created a new protected Vercel preview deployment for the repaired `dev` checkout.
- Confirmed the current Hobby-plan protection behavior: generated preview URLs are protected, but custom domains remain public, so `dev.mycarpal.app` is deferred until the protection/domain strategy changes.

## 2026-03-20 (Unreleased local changes)

### Review Fixes
- Removed blanket auth-time ownership reassignment so unowned vehicles, glovebox documents, and insurance policies can no longer be claimed by whichever user logs in or signs up.
- Made the current Better Auth credential flow explicit: legacy password-only users now fail honestly, and the seed script creates a real Better Auth credential account instead of a dead `passwordHash`-only demo user.
- Moved vehicle photo uploads onto the existing S3-backed upload path and resolved Garage photo URLs through signed object access.
- Standardized date-only parsing/rendering across maintenance, glovebox, vehicle, and alerts flows to prevent one-day drift in US timezones.
- Removed the broken `auth:healthcheck` npm script reference and made `/about` render as a public page with public-header treatment.

### Landing and Onboarding Refresh
- Reworked landing header and hero CTAs so new users are sent directly into signup onboarding instead of being routed through the login screen.
- Replaced the static `/register` page with a guided two-step onboarding experience featuring inline validation, social sign-in shortcuts, and a brief success transition into `/home`.
- Fixed the signup redirect so `/register` now renders its success state before continuing into Home, and removed the decorative car graphic from the register header.
- Hardened Better Auth base URL handling so local onboarding and social-auth callbacks can complete on the active `localhost`, Tailscale IP, or `*.ts.net` host instead of being pinned to a single fallback origin.
- Added first-run Home and Garage guidance so new users with zero vehicles are clearly pointed to add their first vehicle.

### Local Docker / OrbStack Workflow
- Added a full local Docker app service so the Next.js app can run in Docker alongside PostgreSQL during dev testing.
- Added runtime AWS Secrets Manager loading for the app container using the local `personal` AWS profile and mounted `~/.aws` config.
- Added local AWS Secrets Manager loading for `APPLE_CLIENT_ID` so Apple sign-in can match the ECS dev secret wiring.
- Installed OpenSSL in the Docker image to avoid Prisma runtime OpenSSL detection warnings in local containers.
- Added npm helpers for full Docker startup, shutdown, and log tailing, and documented the OrbStack workflow in `README.md`.

### CI/CD and Deployment
- Updated the ECS deploy workflow to detect parked dev runtime state from the ECS service and skip auto-deploy work when `desiredCount = 0`.
- Added a manual `workflow_dispatch` override so parked environments can still be deployed intentionally when needed.

## 2026-03-10 (Unreleased local changes)

### Authentication and Session Reliability
- Completed Better Auth app wiring for social sign-in flows in runtime paths:
  - Added dynamic auth client base URL fallback to `window.location.origin` to avoid callback host mismatches.
  - Added Apple client-secret JWT generation and caching from `APPLE_TEAM_ID` / `APPLE_KEY_ID` / `APPLE_PRIVATE_KEY`.
  - Applied Apple provider compatibility fixes and invalid-code handling improvements.
  - Temporarily disabled legacy auth migration hook pending a follow-up implementation against current Better Auth hooks.
- Preserved compatibility for legacy password hashes by keeping async-safe scrypt verification in Better Auth password callbacks.
- Updated middleware session checks to be Edge-runtime safe using Better Auth API fetch path instead of Node-only auth imports.

### CI/CD and Deployment
- Updated ECS deploy workflow to run automatically on pushes to `dev` (in addition to manual dispatch).
- Hardened ECS task-definition registration step to strip `deregisteredAt` from describe output before re-registering new revisions.
- Added no-op dev trigger commit path to quickly force deploy validation when needed.

### Infrastructure
- Wired Apple and Google auth secrets into `infra/terraform/envs/dev` ECS task secret injection.
- Migrated Terraform remote state configuration to native S3 lockfile backend usage in active envs.
- Added configurable ALB HTTP redirect behavior in Terraform edge module wiring for dev/prod.
- Added dev `deployment_mode` park/wake toggle in Terraform (`active`/`parked`) with parked-mode runtime overrides for ECS scale, autoscaling, NAT, tailscale router, and observability.
- Added park/wake runbook guidance to `infra/terraform/README.md` and updated `infra/terraform/envs/dev/terraform.tfvars.example`.
- Pinned `infra/terraform/envs/dev` backend/provider AWS profile to `personal` so local Terraform commands resolve credentials without shell env setup.
- Removed deprecated `terraform.legacy/` tree to keep `infra/terraform/` as the single active infrastructure source of truth.

### Runtime and Build
- Confirmed application upload path migration from local-disk writes to S3-backed storage flow.
- Hardened Docker build behavior to tolerate missing `public/` directory across CI and ECS image build paths.

## 2026-03-08 (dev)

### Cloud Infrastructure
- AWS infrastructure deployed to us-west-1: ECS Fargate, RDS PostgreSQL 16, S3 uploads bucket, internal ALB, VPC (10.20.0.0/16), IAM roles, ECR repository
- Tailscale subnet router EC2 instance deployed for private VPC access — all tailnet devices can reach internal ALB and VPC resources
- S3 Terraform state backend with native locking (`use_lockfile = true`, Terraform >= 1.10, no DynamoDB)
- GitHub Actions OIDC deploy role configured for zero-credential CI/CD
- App running at `http://internal-mycarpal-dev-alb-889228838.us-west-1.elb.amazonaws.com` (Tailscale access only, not publicly exposed)

## 2026-03-08 (Unreleased local changes)

- Terraform IAM reliability fixes:
  - Added execution-role secret access policy in `infra/terraform/modules/compute/main.tf` for all container secret ARNs.
  - Removed DB/session secret grants from dev task-role wiring in `infra/terraform/envs/dev/main.tf` (least privilege for this launch path).
- CI/CD role and permission fixes:
  - Enabled GitHub OIDC deploy-role creation for dev environment and applied infra updates.
  - Updated CICD deploy policy to allow `ecs:DescribeTaskDefinition` with `Resource = "*"` (required by AWS API behavior).
- Image publish and deploy recovery:
  - Configured GitHub Actions repo vars/secrets for AWS deploy workflow.
  - Restored successful ECR image publish and ECS service deployment via `deploy-ecs.yml`.
  - Verified ECS service steady state (`runningCount=1`) and healthy ALB target in dev.
- Private access hardening:
  - Added immutable subnet-router bootstrap behavior in `infra/terraform/modules/tailscale_subnet_router` (optional `tailscale serve` + startup health check service).
  - Added deterministic router hostname and optional serve-proxy inputs/outputs in `infra/terraform/envs/dev` and `infra/terraform/envs/prod`.
  - Added new private access outputs (`tailscale_private_url`, `tailscale_advertised_routes`, router hostname) and route-approval guidance in docs.
  - Documented reusable-auth-key requirement for subnet router rebuilds.

## 2026-03-07 (Unreleased local changes)

- Infrastructure implementation (Terraform):
  - Added first-pass Terraform stack under terraform/ with reusable modules and environments/dev.
  - Added one-time bootstrap for remote S3 state bucket (mycarpal-terraform-state) with encryption, versioning, and public-access block.
  - Configured S3 backends for dev and prod using native lockfiles (use_lockfile = true).
- Infrastructure documentation updates:
  - Added Terraform workflow and Tailnet-private access guidance in terraform/README.md.
  - Updated root README infrastructure references to current repo paths and Terraform docs entry point.

## 2026-03-01 (Unreleased local changes)

- Infrastructure rollout alignment for AWS account `255662760294` in `us-west-1`:
  - Added private-access controls via `alb_ingress_cidrs` in `dev` and `prod` Terraform environments.
  - Added `enable_autoscaling` toggles in `dev` and `prod` Terraform environments.
  - Updated environment tfvars examples with account/region-aware ECR image URIs and private pre-release examples.
- Containerization baseline added:
  - Added production Dockerfile (`Dockerfile`) for building/running Next.js app in ECS.
  - Added `.dockerignore` for smaller/faster image builds.
- CI/CD workflow refinement:
  - Updated deploy workflow to use `ECR_REPOSITORY_URI` variable directly.
- Documentation updates:
  - Added AWS bootstrap checklist at `docs/infrastructure/aws-account-bootstrap-checklist.md`.
  - Updated infra docs with Cloudflare DNS + ACM guidance and private pre-release recommendations.
  - Updated `Agents.md` with current AWS account/region and pre-release deployment strategy.

## 2026-02-27 (Unreleased local changes)

- Infrastructure foundation added under `infra/terraform`:
  - Added reusable Terraform modules for `network`, `security`, `storage`, `data`, `edge`, `compute`, `observability`, and `cicd`.
  - Added deployable `dev` and `prod` environment compositions with low-cost defaults for initial launch.
  - Added Secrets Manager integration for `DATABASE_URL` and `SESSION_SECRET`.
  - Added optional Route53/ACM integration and optional GitHub OIDC deploy role module.
- CI/CD workflows added:
  - Added `.github/workflows/ci.yml` for app lint + Terraform format/validate checks.
  - Added `.github/workflows/deploy-ecs.yml` for container build/push and ECS deployment on GitHub Actions.
- Infrastructure documentation expansion:
  - Added phased rollout plan at `docs/infrastructure/deployment-phased-plan.md`.
  - Added Terraform implementation readme and backend example at `infra/terraform/README.md` and `infra/terraform/backend-example.hcl`.
  - Updated `Agents.md`, infrastructure docs, and root `README.md` references to reflect new deployment baseline.

## 2026-02-21 (Unreleased local changes)

- DIY learning center expansion:
  - Added `/diy` hub and `/diy/[slug]` article pages with richer how-to coverage.
  - Expanded article catalog with additional maintenance topics (fluids, filters, tires, brakes, electrical, driveline, inspections).
  - Added article metadata consistency (read time, difficulty, estimated service time, tools, steps, resources).
  - Added category-based filtering and a dedicated `Most popular` filter.
  - Reordered DIY layout so Safety and Common Tools appear first in a compact two-column presentation.
- Documentation consolidation:
  - Rewrote `Agents.md` to align with post-`v1.0.0-alpha` product scope and current implementation guardrails.
  - Updated `README.md` route map and status snapshots to include DIY surfaces and current baseline.

## 2026-02-20 (Unreleased local changes)

- Contact + support updates:
  - Added authenticated in-app contact message flow (`/contact`) with server action persistence.
  - Fixed contact form state rendering edge case causing `state.message.trim` runtime error.
  - Cleaned up contact fallback section copy and made support/product emails clickable `mailto:` links.
  - Centered the contact section card and reverted unintended message-box width constraint.
- Navigation and brand behavior:
  - Updated brand lockup links so logo/title route to landing on `/`, `/login`, and `/register`, and to `/home` inside the app.
  - Added nav hover animation polish for clearer header affordance.
- Alerts and home linkage:
  - Added deep links from maintenance alerts on home to `/maintenance#upcoming-maintenance`.
  - Normalized due-status messaging so registration/insurance alerts also show `Due now` when overdue.
  - Styled `Due now` emphasis in alert details.
- Maintenance UX and behavior:
  - Renamed `Add Service` to `Add a Service log`.
  - Renamed `Add a Service Schedule` to `Add Service reminders`.
  - Added recalculate-all action feedback (pending text + result messaging, including no-change state).
  - Added global button press/click motion feedback.
  - Updated service history to always render, recent-first, with show more/less control.
  - Improved upcoming-maintenance row layout to prevent long detail text from crowding date/action controls.
  - Added anchor target `#upcoming-maintenance` for direct navigation.
- Service reminders and schedules:
  - Added optional manual reminder frequencies (`frequencyYears`, `frequencyMiles`) with whichever-comes-first scheduling logic.
  - Added imported-schedule awareness per vehicle: hides redundant import controls and provides optional interval reference toggle.
- Service catalog and intervals:
  - Added predictive service-title suggestions (datalist) while preserving custom manual title entry.
  - Expanded standardized intervals: brake fluid, spark plugs, serpentine belt, differential fluid, transfer case fluid, power steering fluid, battery, timing belt.
  - Normalized standard service names to explicit action verbs (change/replace/inspect/rotate).
- VIN/drivetrain enhancements:
  - Extended VIN decode payload with drivetrain information.
  - Persisted drivetrain on vehicles and used it to conditionally include AWD/4WD-only service intervals.
  - Applied drivetrain-aware filtering in recommended schedule generation and maintenance interval reference display.
- Schema updates:
  - Added `Vehicle.drivetrain`.
  - Added recurring reminder fields: `Reminder.frequencyMiles`, `Reminder.frequencyYears`, `Reminder.frequencyBaseOdometer`, `Reminder.frequencyBaseDate`.
  - Added `ContactMessage` model for contact submissions.
  - Synced local schema via `prisma db push` and regenerated Prisma client.

## 2026-02-19 (Unreleased local changes)

- Added user-level data isolation and ownership scoping:
  - Added `userId` ownership fields and relations for vehicles, glovebox documents, and insurance policies.
  - Scoped garage/home/maintenance/glovebox/vehicle queries and actions to the authenticated user.
  - Added legacy ownership assignment in auth flow for pre-existing unowned records.
- Added profile/account foundation:
  - New `/profile` page with display name, bio, and profile image upload.
  - Added profile icon link in header and moved logout into a dedicated top-right account corner.
- Added a second header menu bar (plain style) with `About Us` and `Contact Us` links and new pages.
- Added top-level home `Alerts` section with read/unread toggles for due maintenance, registration, and insurance policy expirations.
- Updated mailbox notification behavior to reflect unread alerts and react to read/unread state updates.
- Enhanced local mechanic finder:
  - Added ZIP-code search in addition to geolocation.
  - Added progressive "Show more" pagination (10 initial, +7, max 50 shown).
  - Updated explanatory copy and reduced helper text size.
- Updated maintenance UI details:
  - Recalculate-all button now uses a pastel light-blue style.
  - Service History is toggleable.
  - Upcoming and history entry titles use slightly smaller, lighter-bold styling.
  - Strengthened section header emphasis for `Add Service`, `Add a Service Schedule`, and `Upcoming Maintenance`.
- Increased brand slogan contrast and styling so "Vehicle care, with a smile." stands out more over the header road graphics.
- Added decorative faded gutter icons on the landing page edges (wrenches, wheels, tools) to create a busier/fun visual atmosphere.
- Started tracking infrastructure planning doc at `docs/infrastructure/aws-minimal-infra-blueprint.md`.
- Separated mailbox notifications from main nav menu headers:
  - Home now uses a dedicated house icon only.
  - Added a standalone mailbox status control in the header (with alert count/dot) so it is no longer embedded in the Home menu item.
- Home page layout update: moved "Quick Odometer Update" above the Snapshot section.
- Upcoming Maintenance UX refinements:
  - Made the section collapsible and open by default.
  - Moved vehicle filter to the left and "Re-calculate All Dates" control to the right.
  - Updated per-item auto-calculate buttons to a smaller, more subdued pastel style.
  - Added a stronger empty-state callout for "no upcoming services in the next 3 months" with bold emphasis and checkmark icon.
- Added "Find a Local Mechanic" section at the bottom of Maintenance:
  - New secure server-side lookup endpoint at `/api/mechanics/search` using OpenStreetMap Overpass data.
  - Browser geolocation is used only at lookup time.
  - UI includes non-sponsored/non-affiliated reassurance copy.
  - Updated mechanic links to open in Google Maps using URL deep links.
  - Limited returned mechanic results to businesses with address data.
- Updated upcoming-maintenance messaging and controls:
  - Changed empty-state copy to "No upcoming services in the next 3 months!"
  - Hide vehicle filter and "Re-calculate All Dates" when no upcoming items exist in the next 3 months.
  - Updated section helper copy to: "See upcoming services for the next 3 months. Click toggle to see more."
- Garage now shows each vehicle's current mileage under the vehicle title card.
- Refactored Glovebox insurance into a single policy-driven section:
  - Added support for multiple policies.
  - Added per-policy fields for policy ID, expiration date, and coverage scope (all vehicles or one vehicle).
  - Added optional policy document upload and saved-policy listing.
- Updated Glovebox document uploads to support non-vehicle-specific documents via checkbox and optional vehicle association.
- Updated Glovebox "All Uploaded Documents" rows with stronger visual highlighting for existing uploaded files.
- Updated registration document links to more visible "View registration (new tab)" green buttons in both glovebox registration cards and vehicle profile surfaces.
- Added upcoming maintenance controls:
  - Per-item "Modify due date" editing.
  - Per-item "Auto-calculate due date" action.
  - Top-level "Re-calculate All Dates" action.
  - Vehicle filter (all vehicles or one vehicle) for upcoming list.
  - Overdue/today items now render as red "Now" with an exclamation indicator and original due date shown beneath.
- Expanded recommended schedule logic to support per-service due-date recomputation and vehicle-year fallback baselines when history is missing.
- Added server support for schedule override persistence and due-date recalculation actions for both manual reminders and recommended schedule items.
- Refined landing page road animation with stronger alternating curves and path-locked car movement updates.
- Further refined landing road to start from top-right, sweep diagonally, and zig-zag with wider radius curves.
- Re-added landing-page header road decoration near the logo.
- Enabled smooth in-page scrolling for landing anchor links (e.g. "See how it works").
- Updated landing header behavior to show existing-user login signage on `/`.
- Expanded top navigation iconography, including larger home/mailbox notification treatment.
- Added shared vehicle label normalization to render VIN-derived all-caps make/model values in upper camel case across app surfaces.
- Updated add-vehicle flow with manual toggle helper copy and file-upload check indicator.
- Added auth scaffold with account creation/sign-in and session-based route protection for app pages.
- Added logout action/control in the app header area.
- Enhanced glovebox document category support with additional categories:
  - Warranty / coverage
  - Inspection / emissions
  - Purchase / finance
- Updated glovebox document hub display sections for the new categories and tightened vehicle selector UX with multi-vehicle placeholder behavior.
- Updated landing "Built for these drivers in mind" copy and bullets.
- Adjusted landing moving-car start position to begin higher on the road path.
- Added hover pop animation treatment for landing bullet rows and card tiles.
- Reworked maintenance flow:
  - Added toggleable "Add a Service Schedule" section (closed by default).
  - Added import action for recommended schedules with industry-default interval reference rows.
  - Moved manual reminder form into the new schedule section.
  - Updated upcoming section to show only upcoming items by default within next 3 months, with show/hide for items beyond 3 months.
  - Added computed recommended upcoming items based on current mileage and historical service records when schedule import is enabled.
  - Styled and repositioned the main app logout control for stronger visibility.

## 2026-02-18

### `7f736c0` - Document business plan strategy
- Added a new glovebox feature area with server actions/pages/state in `app/glovebox/`.
- Added glovebox document forms in `components/add-glovebox-document-form.tsx`, `components/glovebox-registration-form.tsx`, and `components/glovebox-insurance-form.tsx`.
- Updated core UI/flows across garage, home, maintenance, and vehicle profile pages.
- Updated Prisma data model and seed data in `prisma/schema.prisma` and `prisma/seed.js`.

### `8ccd031` - Add UI and feature enhancements
- Added editable maintenance route/page in `app/maintenance/[id]/page.tsx`.
- Added maintenance edit form in `components/edit-maintenance-form.tsx`.
- Added app logo component and updated app shell/header integration.
- Expanded vehicle catalog and added catalog sync script `scripts/fetch-vpic-catalog.mjs`.
- Updated schema/actions/pages to support expanded maintenance and vehicle profile workflows.

### `c0a6bd3` - Add new Codex environment config
- Added `.codex/environments/environment.toml`.

### `dfc485d` - Add setup and reset scripts
- Added `scripts/dev-setup.sh` and `scripts/dev-reset.sh`.
- Updated `package.json` and `README.md` for setup/reset usage.

### `348f833` - Implement vehicle catalog and odometer updates
- Added vehicle catalog data in `lib/vehicle-catalog.ts`.
- Added odometer update action/state/form flow (`app/home/actions.ts`, `app/home/state.ts`, `components/odometer-update-form.tsx`).
- Added route state modules for garage, maintenance, and vehicle flows.

### `37d8b6c` - Investigate npm prisma setup
- Added maintenance action layer and maintenance/reminder forms.
- Updated add-vehicle and vehicle profile forms.
- Updated maintenance page styling and structure.

### `6c87954` - Analyze AGENTS instructions
- Added initial Next.js App Router + Prisma project scaffold.
- Added core routes: `/home`, `/garage`, `/maintenance`, `/vehicle/[id]`.
- Added base components, Prisma client wiring, schema, seed script, and project config files.

### `697b253` - init commit - Agents.md
- Added `Agents.md`.
- Replaced previous `README.md` content at this step.

### `94c24da` - Initial commit
- Added initial `README.md`.
