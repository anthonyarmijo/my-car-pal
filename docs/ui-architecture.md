# UI Architecture

My Car Pal keeps reusable presentation separate from application behavior. The shared `@my-car-pal/ui` package contains design tokens and accessible React primitives; routes and feature components own authentication, data access, server actions, and business rules.

## Package Boundary

Shared UI belongs in `packages/ui` when it:

- accepts plain props, children, refs, classes, and ARIA attributes;
- renders without a session, database record, route, or provider SDK;
- represents a reusable visual or interaction pattern; and
- can be demonstrated with static Storybook data.

Keep route navigation, authentication, Prisma queries, server actions, uploads, provider adapters, and vehicle-specific workflows in the application layer. Run `npm run check:ui-boundary` before moving a component into the package.

## Components and Tokens

The package exports buttons, cards, badges, form controls, feedback messages, alerts, empty states, page headers, and separators. Runtime styles use the `mcp-*` class prefix and `--mcp-*` CSS custom properties.

Prefer semantic tokens such as surface, text, border, primary action, success, warning, and danger instead of hard-coded colors. Primitive color names remain available for composition, but application screens should express intent through semantic variables and component variants.

The structured token source is `packages/ui/src/tokens/tokens.ts`; `tokens.json` is its generated machine-readable snapshot. After intentional token changes, run:

```bash
npm run tokens:write --workspace @my-car-pal/ui
npm run check:ui-tokens
```

## Theming and Responsive Behavior

- Light and dark themes must both provide complete, intentional surface, text, border, focus, and state colors.
- Shared components must adapt to their container without embedding page-specific breakpoints or fixed application layouts.
- Responsive navigation and page composition remain application responsibilities.
- Motion must be subtle, must not be required to understand content, and must honor `prefers-reduced-motion`.

## Accessibility

- Use real buttons for actions and links for navigation.
- Associate every form control with a visible label.
- Preserve visible keyboard focus and logical tab order.
- Use status semantics for non-blocking feedback and alert semantics for errors.
- Do not rely on color alone to communicate state.
- Keep decorative imagery hidden from assistive technology and provide useful alternative text for meaningful imagery.
- Preserve logical page and section heading order in consuming routes.

## Storybook and Visual Verification

Storybook contains static examples for tokens, primitives, forms, feedback, and app-like compositions:

```bash
npm run storybook
npm run verify:storybook:visual
```

For rendered application checks, build the app and run the route or rendered smoke suite:

```bash
npm run build
npm run test:design-system:routes
npm run test:design-system:rendered
```

The complete local UI gate is `npm run verify:design-system`. It verifies token synchronization, package boundaries, package output, TypeScript, lint, the production build, route behavior, and browser-rendered Storybook/application surfaces.

## Package Evolution

`@my-car-pal/ui` remains source-only while this monorepo is its only consumer. Its public component props and semantic token names should remain stable and framework-neutral. Add compiled package output only when an external consumer or publishing workflow requires it.
