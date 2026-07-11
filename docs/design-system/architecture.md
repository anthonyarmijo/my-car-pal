# My Car Pal Design System Architecture

## Decision

Use a monorepo package at `packages/ui` for the first standalone design-system
boundary.

This is the best fit for the current repository because the app is still a
single Next.js project, the existing components depend heavily on app routes and
server actions, and an incremental package avoids a premature separate repo.
The package is intentionally extraction-friendly: it has its own package name,
source, Storybook stories, token CSS, token manifest, README, visual smoke
workflow, and TypeScript check.

Alternatives considered:
- Separate repository: cleanest long-term boundary, but premature while the app
  still owns most UI patterns and no external consumer exists.
- Temporary `components/ui` folder: lowest setup cost, but too easy to import
  route, auth, data, or feature modules and harder to prepare for Storybook.
- Monorepo package: enough separation now, incremental migration path, and a
  straightforward extraction route later.

## Audit Summary

Move into the design system:
- presentational button, link-button class helper, card, badge, field, form
  message, input, textarea, select, page header, empty state, alert, and
  separator patterns
- color, spacing, radius, shadow, focus, and typography tokens (manifest still
  named `desert-graphite` for compatibility; values follow the Warm
  Scandinavian Garage direction — see `docs/design/warm-scandinavian-garage.md`)
- static examples for common vehicle, maintenance, glovebox, and alert states
- low-risk auth form controls where auth behavior remains owned by app routes

Keep in the app:
- `AppShell`, `HeaderNavSlot`, `AppLogo`, and route navigation because they
  read session/profile state or encode app routing
- add/edit vehicle, maintenance, reminder, insurance, registration, upload,
  profile, and onboarding workflows because they call server actions or own
  feature-specific state; these workflows may consume primitives without moving
  workflow logic into the package
- local mechanic lookup, weather badge, activation checklist, upcoming
  maintenance, service history, and DIY browser because they fetch, filter, or
  render feature data

## Package Rules

Design-system components must be presentational and data-agnostic. They may
accept plain props, children, CSS classes, refs, and ARIA attributes. They must
not import from `app/`, `lib/`, Prisma, Better Auth, route handlers, server
actions, provider SDKs, or feature data modules.

Naming uses the `mcp-*` CSS prefix and PascalCase React component names. Tokens
use `--mcp-*` CSS custom properties. App-specific class names such as
`vehicle-card`, `activation-card`, or `mailbox-status-button` should remain in
the app until they are generalized.

The remaining `components/ui` files are transition adapters for legacy app
classes, not new design-system source. `components/ui/button.tsx` and
`components/ui/card.tsx` were retired after their active call sites moved to
`@my-car-pal/ui`; field, page-header, section-header, date-icon, and class-name
helpers remain to preserve older class contracts such as `field-grid`,
`page-title`, and date-input overlay markup. Do not move app logic into those
adapters, and do not rewrite them to delegate to package primitives until the
resulting layered `mcp-*` and legacy styles have been browser-reviewed.

## Tokens

The package exports `@my-car-pal/ui/styles.css`, which includes:
- warm porcelain/cream surfaces
- moss/forest green primary actions (Warm Scandinavian Garage direction;
  legacy tobacco/copper primitives are retained for compatibility)
- sand/taupe borders and graphite text neutrals
- muted blue-gray secondary states
- sage success states only
- warning and error tones for validation and due-state messaging

The structured source is `packages/ui/src/tokens/tokens.ts`. It exports
`desertGraphiteTokens` and `desertGraphiteCssVariables` for docs, Storybook,
and future theme adapters. `packages/ui/src/tokens/tokens.json` is a generated
machine-readable snapshot for tools that cannot import TypeScript.

Run `npm run check:ui-tokens` to verify that `tokens.json` matches the
TypeScript source. Run `npm run tokens:write --workspace @my-car-pal/ui` after
intentional token changes to regenerate the snapshot.

Use tokens through component props first. When a screen needs custom layout,
prefer `--mcp-*` variables over hard-coded colors so later shadcn/Tailwind
migration can map tokens into a theme.

Mapping guidance:
- Tailwind colors should prefer semantic slots such as `action.primary`,
  `surface`, `border`, `state.warning`, and `state.danger`.
- shadcn component variables can map `background` to
  `--mcp-color-surface`, `foreground` to `--mcp-color-text`, `border` to
  `--mcp-color-border`, `ring` to `--mcp-focus-ring-color`, and radius to
  `--mcp-radius-md`.
- Sage must map only to success tokens; do not use it for neutral decoration.

## Accessibility Expectations

- Buttons must use real `button` elements for actions.
- Form controls must have labels through `Field` or equivalent app markup.
- Error messages use `role="alert"` through `FormMessage tone="error"`.
- Focus states must remain visible and meet contrast expectations.
- Alerts use `role="status"` for non-error states and `role="alert"` for errors.
- Decorative separators should remain presentation-only; semantic separators
  should set `decorative={false}`.

## Storybook

Storybook documents the package primitives in isolation:
- `Design System/Tokens`
- `Design System/Primitives`
- `Design System/Forms`
- `Design System/App Compositions`

Stories use realistic My Car Pal states but do not fetch data or import app
logic. `Design System/Forms/AuthEntryComposition` mirrors the migrated login
composition with static fields and messages so visual QA can review route-level
primitive assembly without auth behavior. The forms stories also include a
`FormMessage as="div"` example for nested follow-up actions such as the
app-owned add-vehicle success handoff.

Run `npm run verify:storybook:visual` for local visual QA. The command builds
Storybook, serves `storybook-static`, visits the token, primitive, feedback, and
form stories in Playwright at desktop and mobile widths, fails on blank roots,
console errors, page errors, or framework overlays, and saves screenshots to
`/tmp/my-car-pal-storybook-visual-smoke` unless
`STORYBOOK_VISUAL_OUTPUT_DIR` is set.

Run `npm run test:design-system:rendered` after `npm run build` when you need
browser-level route QA without rebuilding Storybook. It starts `next start`,
checks `/`, `/login`, `/register`, `/about`, and protected redirect states for
`/contact`, `/profile`, `/garage`, `/maintenance`, and `/glovebox` across
desktop and mobile, fills safe fields without submitting,
fails on blank pages, framework overlays, console/page errors, or missing
expected `mcp-*` markers, and saves screenshots to
`/tmp/my-car-pal-rendered-smoke` unless `DESIGN_SYSTEM_RENDERED_OUTPUT_DIR` is
set. Set `DESIGN_SYSTEM_SMOKE_EMAIL` and `DESIGN_SYSTEM_SMOKE_PASSWORD` to add
authenticated render checks for `/profile`, `/garage`, `/maintenance`,
`/glovebox`, and `/contact`.

Run `npm run verify:design-system` for the complete local gate: token snapshot
sync, package boundary, package tarball audit, UI typecheck, app typecheck,
lint, production build, production route smoke for migrated app surfaces, and
rendered app plus Storybook visual smoke. The runner removes generated
`storybook-static` output when it exits.

Run `npm run test:design-system:routes` after `npm run build` when you only
need route-level smoke coverage. It starts `next start` on an ephemeral local
port, verifies `/login`, `/register`, and `/auth-error` render expected
`mcp-*` package markers, verifies `/about`, `/privacy`, and `/terms` render
migrated package wrappers, and verifies `/contact`,
`/garage`, `/maintenance`, `/glovebox`, `/home`, `/vehicle/[id]`, and
`/profile` keep their unauthenticated redirects to `/login`.

Baseline policy is intentionally lightweight for now. Use CI screenshot
artifacts as the current durable visual review path. Do not check Playwright
snapshots into the repo until baseline ownership, tolerances, and approval
rules are explicit; do not introduce a hosted visual vendor until the app has a
clear need for that workflow.

## Boundary Verification

Run `npm run check:ui-boundary` before moving any component into `packages/ui`.
The check blocks imports from app aliases, app routes, app `lib/`, Prisma,
Better Auth, selected Next runtime APIs, storage providers, and server action
directives.

## Incremental Migration Notes

Detailed migration inventory lives in
`docs/design-system/migration-notes.md`.

First migrated surfaces:
1. `/login` now uses `@my-car-pal/ui` cards, badges, fields, inputs, button,
   and error message while keeping redirects and `loginAction` in the app.
2. `/auth-error` now uses package cards, badges, error feedback, and
   `getButtonClassName` for the app-owned recovery link while keeping auth copy
   decoding in the app.
3. `/about`, `/privacy`, and `/terms` now use package cards and badges while
   keeping static copy and page-specific legacy classes in the app.
4. `RegisterOnboarding` now uses package fields, inputs, buttons, and error
   messages while keeping signup state, social-auth callbacks, and server action
   submission in the app.
5. `/contact` now uses package card, badge, field, textarea, button, and
   feedback primitives while keeping the auth gate and
   `sendContactMessageAction` in the app.
6. `/profile` account editing now uses package card, badge, field, input,
   textarea, button, and saved-feedback primitives while keeping auth, Prisma
   queries, avatar upload, core allowance copy, and `updateProfileAction` in
   the app.
7. Home dashboard badges now use package `Badge` while preserving the legacy
   `badge` class during visual transition and keeping alert data, primary
   vehicle selection, and dashboard layout in the app.
8. Garage, Maintenance, and Glovebox first-run empty states now use package
   `EmptyState` while keeping vehicle, service history, registration, and
   insurance queries in app/server code.
9. Garage add-vehicle VIN-decode and post-submit feedback now uses package
    `FormMessage`, including `as="div"` for the nested follow-up action, while
    keeping VIN decode state, add-vehicle action, reset behavior, follow-up
    routing, and vehicle catalog state in the app.
10. Home, Garage, Maintenance, and Glovebox authenticated page shells now use
    package `Card`, `Button`, and `getButtonClassName` for low-risk
    presentation while preserving legacy layout classes and all data/action
    behavior in app code.
13. Maintenance add-service, schedule/import, and service-edit feedback now
    uses package `Button` and `FormMessage` primitives where the wrapper is
    presentational, while keeping server actions, controlled refs, reset
    effects, and schedule logic in the app.
14. Glovebox document upload, registration, insurance policy feedback, and
    document action rows now use package `Button`/`FormMessage` primitives
    while keeping upload actions, registration archive rendering, policy state,
    app-local fields, file inputs, and ownership checks in the app.
15. Vehicle profile form feedback and registration replacement submit actions
    now use package `Button` and `FormMessage` primitives while preserving
    hidden inputs, server action `name`/`value` semantics, file upload controls,
    and local toggle state.
16. Reminder and profile avatar feedback now use package `FormMessage` while
    preserving reminder resets and avatar auto-submit/router refresh behavior
    in the app.

Recommended next low-risk surfaces:
1. Replace standalone `button-primary` and `button-chip` usages inside client
   components with `Button` where the element is already a `button`.
2. Replace static section wrappers with `Card` only when no route/data behavior
   is embedded in the wrapper.
3. Replace repeated form label/control/message markup with `Field`, `Input`,
   `Select`, `Textarea`, and `FormMessage`.
4. Use `getButtonClassName` for app-owned `Link` or `a` elements that need
   design-system button styling; keep routing behavior in app code.
5. Avoid moving feature components until their data contract is reduced to plain
   props.

Legacy-to-package replacements:
- `button.button-primary` -> `<Button>`
- `Link`/`a` with `button-primary` styling -> `className={getButtonClassName()}`
- `button.button-chip` -> `<Button variant="secondary">` for neutral actions
- `section.section-card` with static content -> `<Card as="section">`
- `p.badge` or `span.badge` -> `<Badge>`
- `label.field > input` -> `<Field label htmlFor><Input id /></Field>`
- `p.form-message-error` -> `<FormMessage tone="error">`

Do not migrate server actions, auth checks, Prisma queries, storage ownership
checks, or provider adapters into `packages/ui`.

## shadcn/Tailwind Readiness

This package does not force Tailwind or shadcn into the app. The current CSS
token names and component variants map cleanly to a future Tailwind theme and
shadcn-style component layer. A later migration can replace the CSS internals
while preserving the public React component API.

## Publishability

Keep `@my-car-pal/ui` source-only for now. Next.js transpiles it through
`transpilePackages`, the monorepo is the only consumer, and the current
`build:ui` command provides a fast TypeScript contract check. The package
manifest has a `files` allowlist for runtime source, styles, tokens, and docs;
`npm run check:ui-pack` dry-runs the package tarball and blocks Storybook
fixtures, internal scripts, generated output, env files, and unexpected paths
before any future extraction. Add a minimal build output later when the package
needs external consumption, generated theme artifacts, or npm publishing.

## Claude `/design-sync` Compatibility

The current readiness checklist lives in
`docs/design-system/design-sync-readiness.md`.

The package is closer to `/design-sync` readiness because primitives, tokens,
and examples now live behind a clean package boundary. Remaining blockers:
- no Figma token export yet
- no durable visual regression baseline ownership policy yet
- app screens still use many legacy global classes directly, though the
  button/card transition adapters have been removed
- `@my-car-pal/ui` exports source TypeScript for monorepo use and needs a
  publishable build artifact before external consumption
- auth, contact, and profile account surfaces have begun migrating to package
  primitives, and first-run Garage/Maintenance/Glovebox empty states plus
  maintenance, Glovebox, and vehicle/profile feedback actions use package
  primitives, but field/header/date presentation still uses legacy adapters

Attempt `/design-sync` after the package has a visual regression pass, a token
export format, and at least the highest-traffic app screens migrated to the
package primitives.
