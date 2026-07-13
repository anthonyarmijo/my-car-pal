# My Car Pal UI

`@my-car-pal/ui` is the shared presentation layer for My Car Pal. It contains framework-neutral React primitives, semantic design tokens, CSS, and Storybook examples.

## Boundary

The package may contain reusable components that render from plain props without application state. It must not import routes, Prisma, Better Auth, server actions, provider SDKs, feature data loaders, or app-specific workflows.

Run the boundary check before moving code into the package:

```bash
npm run check:ui-boundary
```

## Usage

Import the package stylesheet once at the application root:

```tsx
import "@my-car-pal/ui/styles.css";
```

Then import components from the package:

```tsx
import { Button, Card, CardContent, CardHeader, CardTitle } from "@my-car-pal/ui";
```

The package currently exports:

- `Button` and `getButtonClassName`
- `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, and `CardFooter`
- `Badge`, `Alert`, `EmptyState`, and `Separator`
- `Field`, `Input`, `Textarea`, `Select`, and `FormMessage`
- `PageHeader`

## Tokens

The token source is `src/tokens/tokens.ts`, the generated tooling snapshot is `src/tokens/tokens.json`, and runtime variables live in `src/styles/tokens.css`.

Use component props first. When custom layout styling is required, prefer semantic `--mcp-*` variables over raw values:

```css
.example {
  background: var(--mcp-color-surface);
  border-color: var(--mcp-color-border);
  color: var(--mcp-color-text);
}
```

After changing tokens, regenerate and verify the snapshot:

```bash
npm run tokens:write --workspace @my-car-pal/ui
npm run check:ui-tokens
```

## Accessibility

- Use real buttons for actions and links for navigation.
- Pair each form control with a label and matching `id`.
- Preserve visible focus states and semantic feedback roles.
- Use `FormMessage tone="error"` for validation errors.
- Use semantic separators only when the separator communicates structure.
- Preserve heading order in the consuming page.

## Storybook and Verification

Stories use realistic static states without importing application behavior:

```bash
npm run storybook
npm run verify:storybook:visual
```

Run `npm run check:ui-pack` to audit the future package contents and `npm run verify:design-system` for the complete token, boundary, type, build, route, and browser-rendering gate.

The package remains source-only while the monorepo is its only consumer. Add compiled output when an external consumer or publishing workflow requires it.

See [`docs/ui-architecture.md`](../../docs/ui-architecture.md) for the repository-wide UI boundary and verification policy.
