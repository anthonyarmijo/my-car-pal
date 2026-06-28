# Claude `/design-sync` Readiness

This checklist tracks what must be true before attempting Claude
`/design-sync` against `@my-car-pal/ui`.

Verification evidence and rendered browser QA notes are tracked in
`docs/design-system/verification-audit.md`.

## Current Status

| Area | Status | Evidence |
| --- | --- | --- |
| Package boundary | Ready for initial sync | `packages/ui` has its own package manifest, TypeScript config, exports, README, Storybook stories, and boundary check. |
| Runtime tokens | Ready | `packages/ui/src/styles/tokens.css` exposes `--mcp-*` CSS custom properties. |
| Structured tokens | Ready | `packages/ui/src/tokens/tokens.ts` and generated `tokens.json` define color, spacing, radius, shadow, typography, focus, and semantic state tokens; `npm run check:ui-tokens` verifies snapshot sync. |
| Primitive coverage | Partial but usable | Presentational buttons, cards, badges, fields, controls, alerts, separators, page headers, and empty states exist. |
| Storybook review | Ready for local/CI review | `npm run storybook`, `npm run build-storybook`, `npm run verify:storybook:visual`, and `npm run verify:design-system` are available, including auth-entry, nested-feedback, and app-composition examples that mirror migrated route primitives without importing app code. CI runs the full gate. |
| Visual QA | Smoke ready, CI artifacts recommended | Playwright smoke screenshots are generated outside the repo for Storybook and rendered app checks. Use CI artifacts for the current durable review path; defer checked-in snapshots until the UI API and threshold ownership settle. |
| Route QA | HTTP and rendered smoke ready | `npm run test:design-system:routes` checks migrated public/auth surfaces against `next start`; `npm run test:design-system:rendered` covers `/`, `/login`, `/register`, `/about`, `/contact`, `/profile`, Garage, Maintenance, and Glovebox redirect/render states on desktop/mobile. |
| Real app adoption | Broadening | `/login`, `/auth-error`, `/about`, `/privacy`, `/terms`, register onboarding controls, Home dashboard cards/actions/badges, Garage page shell/add-vehicle feedback/image action, Maintenance page shell/add/reminder/schedule/service feedback, Glovebox page shell/document/registration/insurance feedback, vehicle profile form feedback/actions, profile avatar feedback, `/contact` page/form controls, and `/profile` account form controls use package primitives. |
| Publishability | Deferred intentionally | Source exports are correct for the monorepo, and the package now has a runtime/docs `files` allowlist verified by `npm run check:ui-pack`; add a build output only for external consumers or generated design artifacts. |

## Must Happen Before `/design-sync`

- Choose whether Figma/design tokens consume the checked `tokens.json`
  snapshot directly or a future Style Dictionary-style transform.
- Keep CI screenshot artifacts as the current visual baseline strategy. Revisit
  checked-in Playwright snapshots only after review ownership and threshold
  update rules are explicit.
- Migrate at least the highest-traffic auth and static form surfaces to package
  primitives. Initial auth, contact, and profile account surfaces are covered;
  Garage, Maintenance, Home, and Glovebox now use package cards/buttons for
  low-risk presentation; continue with explicit Field and header migrations.
- Decide whether `/design-sync` needs compiled package artifacts. If yes, add a
  minimal build output before sync; if no, keep source exports.
- Document any intentional differences between app-global legacy classes and
  `mcp-*` component styling.
- Keep the `components/ui` transition adapters documented until their legacy
  classes are either migrated call-site by call-site or intentionally retired.

## Do Not Sync Yet If

- New package components import route, auth, data, provider, or server-action
  code.
- Sage is used outside positive/success semantics.
- Storybook visual smoke fails or screenshots show blank/overlapped controls.
- A migrated app surface changes route behavior, server action behavior, or
  user data ownership checks.
- The package API is churny enough that generated design artifacts would be
  obsolete within the next migration.

## Recommended Next Increment

1. Publish CI screenshot artifacts from rendered app and Storybook smoke runs.
2. Continue migrating explicit field groups and authenticated page headers
   after desktop/mobile visual review.
3. Re-run the full verification suite listed in the project goal.

## Visual Baseline Decision

Current recommendation: **CI artifacts only**.

Why:
- It keeps screenshots reviewable without committing volatile image baselines.
- It works with the existing Playwright smoke scripts and Vercel/GitHub flow.
- It avoids a hosted vendor before the design-system API and approval process
  are stable.

Deferred options:
- Checked-in Playwright snapshots can add stricter regression protection later,
  but they need clear ownership for baseline updates and tolerances.
- A hosted visual review service is not justified yet because the team has a
  small app surface, no cross-browser matrix requirement, and no separate
  design approval queue.
