# My Car Pal UI

`@my-car-pal/ui` is the first design-system package boundary for My Car Pal.
It contains presentational React primitives and CSS tokens only.

## What Belongs Here

- Reusable UI primitives: buttons, cards, badges, form controls, alerts, separators, page headers, and empty states.
- Design tokens for the Desert Graphite visual system.
- Storybook examples using realistic but static My Car Pal states.
- Accessibility expectations that apply to all app surfaces.

## What Does Not Belong Here

- Prisma, Better Auth, route handlers, server actions, app fetchers, feature data loaders, or business rules.
- Vehicle, maintenance, glovebox, billing, or auth workflows.
- Components that need a concrete route, database record, session, or provider adapter to render.

## Usage

Import the package CSS once at the app root:

```tsx
import "@my-car-pal/ui/styles.css";
```

Use primitives from the package:

```tsx
import { Button, Card, CardContent, CardHeader, CardTitle } from "@my-car-pal/ui";
```

The package currently exports source TypeScript for the local monorepo and is
configured through `next.config.ts` with `transpilePackages`. Add a bundling
step before publishing it outside this repository.

## Tokens

The structured source is `src/tokens/tokens.ts`. A generated JSON snapshot for
design tooling lives at `src/tokens/tokens.json`, and the runtime CSS variables
live in `src/styles/tokens.css`.

The source covers:
- primitive and semantic color tokens
- spacing, radius, and shadow
- typography family, size, line-height, and weight
- focus-ring tokens
- success, warning, danger, and info state tokens

Use CSS variables in runtime styling:

```css
.example {
  border-color: var(--mcp-color-border);
  color: var(--mcp-color-text);
}
```

Use the manifest when a tool or adapter needs a stable map:

```ts
import { desertGraphiteTokens } from "@my-car-pal/ui/tokens";
```

When token names or CSS variables change, regenerate and verify the JSON
snapshot:

```bash
npm run tokens:write --workspace @my-car-pal/ui
npm run check:ui-tokens
```

Future Tailwind/shadcn theme config should map semantic names first:
`color.action.primary` -> `--mcp-color-action-primary`, `color.border` ->
`--mcp-color-border`, `radius.md` -> `--mcp-radius-md`, and so on.

## Architecture

`packages/ui` is the recommended first step instead of a separate repository.
It gives My Car Pal a real package boundary while the app is still a single
Next.js product, and it can be extracted later when component APIs, token
exports, and visual review workflows are stable.

The package intentionally has no dependency on Next.js, Prisma, Better Auth,
server actions, route handlers, provider SDKs, or feature data fetching. Run
`npm run check:ui-boundary` from the repository root before moving app code into
this package. Run `npm run check:ui-tokens` after token edits to prove
`tokens.json` still matches `tokens.ts`.

## Components

- `Button`
- `getButtonClassName`
- `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`,
  `CardFooter`
- `Badge`
- `Field`
- `FormMessage`
- `Input`
- `Textarea`
- `Select`
- `PageHeader`
- `EmptyState`
- `Alert`
- `Separator`

## Token Rules

Use `--mcp-*` CSS custom properties for shared color, space, radius, shadow,
focus, and typography decisions. Component variants should express common UI
intent such as `primary`, `secondary`, `success`, `warning`, or `danger`; app
screens should not reach for raw hex colors when a token exists.

Sage is reserved for positive and success states. Tobacco/copper carries the
primary action and accent role. Blue-gray is for secondary/informational states.
Sand/taupe is for borders and quiet structure.

## Migration Notes

The contributor migration inventory lives in
`docs/design-system/migration-notes.md`.

Low-risk app migrations should replace markup without moving behavior:

| Legacy app pattern | Design-system replacement |
| --- | --- |
| `button.button-primary` | `<Button>` |
| `Link` or `a` styled as `button-primary` | `className={getButtonClassName()}` |
| `button.button-chip` for neutral actions | `<Button variant="secondary">` |
| `section.section-card` with static content | `<Card as="section">` |
| `p.badge` or `span.badge` | `<Badge>` |
| `label.field > input` | `<Field label htmlFor><Input id /></Field>` |
| `p.form-message-error` | `<FormMessage tone="error">` |
| Nested feedback panel | `<FormMessage as="div">` |

Keep feature-owned forms in `components/` while they call server actions, own
optimistic state, or depend on vehicle/glovebox/maintenance data. It is fine for
those app forms to consume primitives from this package; the form workflow
itself should not move here.

## Accessibility

Keep primitives semantic by default. Use real buttons for actions, pair every
form control with a label, preserve visible focus states, use
`FormMessage tone="error"` for validation errors, use
`FormMessage as="div"` only when feedback contains nested action content, and
choose semantic separators with `decorative={false}` only when the separator
conveys structure.

Component category expectations:
- Buttons: use `type="button"` by default, set `type="submit"` only in forms,
  and keep disabled states visible.
- Forms: pair `Field htmlFor` with a matching control `id`; error messages
  should use `FormMessage tone="error"` so `role="alert"` is applied.
- Feedback: alerts should use non-error status semantics by default and error
  semantics only for blocking failures.
- Cards and empty states: preserve heading order from the consuming page.

## Storybook

Run `npm run storybook` from the repository root to review isolated token,
primitive, form, and app-composition examples. Stories should stay static and
realistic: they may show My Car Pal states, but they should not fetch app data
or import app modules. The auth-entry composition story mirrors the migrated
login primitive assembly without auth behavior. App-composition stories cover
authenticated page header/action clusters, Garage empty/first-run states,
Maintenance reminder/service feedback, Glovebox document/insurance status, and
alert/callout variants.

For repeatable local visual QA:

```bash
npm run verify:storybook:visual
```

This builds Storybook, serves `storybook-static`, checks key stories at desktop
and mobile widths with Playwright, fails on blank renders or console/page
errors, and saves screenshots to `/tmp/my-car-pal-storybook-visual-smoke` by
default. Set `STORYBOOK_VISUAL_OUTPUT_DIR` to choose another artifact folder.

For rendered app QA after `npm run build`:

```bash
npm run test:design-system:rendered
```

This starts `next start`, checks desktop and mobile routes, verifies protected
redirects, fills safe non-submitted fields, checks expected `mcp-*` markers,
and saves screenshots to `/tmp/my-car-pal-rendered-smoke` by default. Set
`DESIGN_SYSTEM_SMOKE_EMAIL` and `DESIGN_SYSTEM_SMOKE_PASSWORD` to include
authenticated Garage, Maintenance, Glovebox, Profile, and Contact renders.

Visual baselines should stay outside the repo until the team chooses a durable
review policy. When that happens, promote the screenshots from this smoke flow
into the chosen baseline store and keep threshold decisions in the visual QA
tool, not in component code.

For the complete design-system gate, run:

```bash
npm run verify:design-system
```

This runs token snapshot sync, package boundary, package dry-run audit, UI
typecheck, app typecheck, lint, production build, route smoke for migrated app
surfaces, rendered app smoke, and Storybook visual smoke, then removes
generated `storybook-static` output.

## Publishability Recommendation

Keep source exports for now. The package has one consumer, Next.js already
transpiles it, and a bundler would add process before it adds product value.
The package manifest includes a `files` allowlist so a future npm tarball keeps
runtime source, styles, tokens, and docs while excluding Storybook fixtures and
internal verification scripts.

Use this as the local publishability audit:

```bash
npm run check:ui-pack
```

The check runs `npm pack --dry-run --json` for the workspace and fails if
Storybook fixtures, internal package scripts, generated static output, env
files, or other unexpected paths would enter the package tarball.

Add a minimal build output later when one of these becomes true:
- the package is consumed outside this monorepo
- Storybook or tests need compiled artifacts
- `/design-sync` requires generated token/theme assets
- npm publishing becomes part of the public-core workflow

The `/design-sync` readiness checklist lives in
`docs/design-system/design-sync-readiness.md`.
