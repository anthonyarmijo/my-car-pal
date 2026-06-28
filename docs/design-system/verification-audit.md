# Design-System Verification Audit

This audit tracks the evidence for operationalizing `@my-car-pal/ui`.

## Current Verdict

The design-system gate is automated and passing, and rendered app QA is proven
as of 2026-06-28. Codex in-app Browser setup failed in this environment because
the browser client was not trusted, so rendered app QA used the documented
Playwright fallback path.

## Requirements And Evidence

| Requirement | Evidence | Status |
| --- | --- | --- |
| Structured token source of truth | `packages/ui/src/tokens/tokens.ts`, generated `tokens.json`, `tokens.css`, and `npm run check:ui-tokens` | Proven |
| Token JSON cannot drift silently | `packages/ui/scripts/check-tokens.mjs` and `tokens:write` workflow | Proven |
| Storybook visual QA exists | `npm run verify:storybook:visual` builds Storybook and screenshots primitive, form, and app-composition stories across desktop/mobile, including nested `FormMessage as="div"` feedback | Proven |
| Route-level smoke for migrated app surfaces exists | `npm run test:design-system:routes` starts `next start` and checks migrated public/auth surfaces plus protected redirects for contact, garage, maintenance, glovebox, home, vehicle detail, and profile | Proven |
| Rendered route smoke exists | `npm run test:design-system:rendered` starts `next start`, checks desktop/mobile rendered states for `/`, `/login`, `/register`, `/about`, `/contact`, `/profile`, Garage, Maintenance, and Glovebox redirect/render behavior, fills safe fields, checks package markers, and saves screenshots outside the repo | Proven |
| Package boundary is guarded | `npm run check:ui-boundary` blocks app/server/provider imports in `packages/ui` | Proven |
| Package tarball shape is guarded | `npm run check:ui-pack` dry-runs package output and blocks fixtures, scripts, env files, generated output, and unexpected paths | Proven |
| One-command local gate exists | `npm run verify:design-system` runs token, boundary, pack, UI build, app typecheck, lint, production build, route smoke, and Storybook visual smoke | Proven |
| CI runs the design-system gate | `.github/workflows/ci.yml` installs Playwright Chromium and runs `npm run verify:design-system` in App Checks | Proven by workflow configuration |
| Broad low-risk app migrations are in place | `/login`, `/auth-error`, `/about`, `/privacy`, `/terms`, `/contact`, `/profile`, register onboarding, Home/Garage/Maintenance/Glovebox page shell cards/actions, Garage add-vehicle/image feedback, Garage/Maintenance/Glovebox first-run empty states, Maintenance add/reminder/schedule/service feedback, Glovebox document/registration/insurance feedback/action rows, vehicle profile form feedback/actions, and profile avatar feedback consume package primitives while app behavior remains app-owned | Proven by source and route smoke where public/redirect behavior is observable |
| Remaining app-local UI wrappers are classified | `docs/design-system/migration-notes.md` and `docs/design-system/architecture.md` document `components/ui` transition adapters and migration conditions | Proven |
| Removed legacy adapters are accounted for | `components/ui/button.tsx` and `components/ui/card.tsx` have no active call sites and were removed; remaining field/header/date adapters are inventoried | Proven |
| Full rendered app browser QA | Playwright rendered app smoke is repeatable through `npm run test:design-system:rendered`; screenshots are saved under `/tmp/my-car-pal-rendered-smoke` by default, with optional authenticated route render checks via `DESIGN_SYSTEM_SMOKE_EMAIL`/`DESIGN_SYSTEM_SMOKE_PASSWORD` | Proven |

## Latest Gate

Run:

```bash
npm run verify:design-system
```

Last local result on 2026-06-28: passed after the broad app-adoption patch.
The run covered token sync, package boundary and pack checks, UI build, app
typecheck, lint, production build, migrated-route smoke, rendered app smoke,
Storybook build, and Storybook visual smoke. The only app warnings were the
known landing `<img>` lint warnings.

Expected coverage:
- token JSON sync
- UI package boundary
- UI package tarball audit
- UI package TypeScript build
- app TypeScript check
- lint
- production build
- migrated-route HTTP smoke for public/auth surfaces and protected redirects
- rendered app smoke across public and protected redirect states
- Storybook visual smoke

CI coverage:
- `.github/workflows/ci.yml` runs the same gate on pull requests to `main` and
  pushes to `main` or `dev`.

Known warnings:
- Existing landing `<img>` warnings in `components/landing/PhotoShowcase.tsx`
  and `components/landing/VideoHero.tsx`.

## Rendered Browser QA

Rendered QA command covers:
- `/`
- `/login`
- `/register`
- `/about`
- `/contact` protected redirect to `/login`
- `/profile` protected redirect to `/login`
- `/garage` protected redirect to `/login`
- `/maintenance` protected redirect to `/login`
- `/glovebox` protected redirect to `/login`
- optional authenticated `/profile`, `/garage`, `/maintenance`, `/glovebox`,
  and `/contact` renders when smoke credentials are supplied

Evidence:
- Browser plugin path: not required for the repeatable command; use Playwright
  directly so it works in local and CI production-server checks.
- Viewports: desktop `1280x900` and mobile `390x844`.
- Checks: final URL, nonblank body text, no framework overlay, console
  error/pageerror health, package marker counts, safe field fills for
  login/register/profile/contact, and protected-route redirects.
- Latest screenshots: `/tmp/my-car-pal-rendered-smoke`.
- Authenticated coverage: set `DESIGN_SYSTEM_SMOKE_EMAIL` and
  `DESIGN_SYSTEM_SMOKE_PASSWORD`; without those env vars the command still
  proves protected redirects and public render health. The latest local run used
  the seeded preview user (`preview-demo@mycarpal.local`) and captured
  authenticated `/profile`, `/garage`, `/maintenance`, `/glovebox`, and
  `/contact` screenshots on desktop and mobile.

## Storybook Visual QA

Latest screenshots: `/tmp/my-car-pal-storybook-visual-smoke`.

Latest run checked 12 stories across desktop and mobile:
- tokens
- primitive buttons/badges, cards/header, and feedback states
- form vehicle details, validation, and auth-entry composition
- app-composition authenticated header, Garage empty state, Maintenance
  feedback, Glovebox status, and alert variants

Known Storybook warning:
- Vite reported large Storybook chunks during the static build. The build and
  visual smoke still passed; this is a Storybook bundle-size warning, not an app
  runtime failure.

## Completion Criteria

Mark the goal complete only after:
1. `npm run verify:design-system` passes.
2. `npm run test:design-system:rendered` succeeds for the routes listed above.
3. Any browser findings are fixed or explicitly documented as pre-existing and
   unrelated to the design-system work.
