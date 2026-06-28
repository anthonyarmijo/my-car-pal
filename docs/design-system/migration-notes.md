# Design-System Migration Notes

Use this as the working inventory for moving real app surfaces onto
`@my-car-pal/ui` without moving app behavior into the package.

## Current Usage

The app imports `@my-car-pal/ui/styles.css` once in `app/layout.tsx`. Initial
component adoption is intentionally narrow:

| Surface | Adopted primitives | Behavior ownership |
| --- | --- | --- |
| `/login` | `Card`, `Badge`, `Field`, `Input`, `Button`, `FormMessage` | Redirects, auth lookup, and `loginAction` remain in app code. |
| `/auth-error` | `Card`, `Badge`, `FormMessage`, `getButtonClassName` | Error-code decoding and auth copy remain in app code. |
| `/about`, `/privacy`, `/terms` | `Card`, `Badge` | Static page copy and page-specific legacy classes remain in app code. |
| `/register` onboarding | `Field`, `Input`, `Button`, `FormMessage` | Step state, social auth callbacks, and `signupAction` remain in app code. |
| `/contact` page and form | `Card`, `Badge`, `Field`, `Textarea`, `Button`, `FormMessage` | Auth gate, contact message action, validation state, and form reset remain in app code. |
| `/profile` account form | `Card`, `Badge`, `Field`, `Input`, `Textarea`, `Button`, `FormMessage` | Auth, profile query, avatar upload, core allowance copy, and `updateProfileAction` remain in app code. |
| Garage add-vehicle feedback | `FormMessage` | VIN decode state, add-vehicle action, reset behavior, follow-up link, and vehicle catalog state remain in app code. |
| Authenticated Home dashboard cards/actions | `Card`, `Button`, `getButtonClassName`, `Badge` | Alert actions, odometer actions, core allowance state, primary vehicle selection, and dashboard layout remain app-owned; legacy layout classes are preserved on package cards. |
| Garage page shell/actions | `Card`, `EmptyState`, `getButtonClassName` | Vehicle queries, allowance checks, activation prompts, image upload flow, and add-vehicle action remain in app/server code; legacy card layout classes are preserved. |
| Home dashboard badges | `Badge` | Home alert data, primary vehicle selection, and dashboard layout remain in app code; legacy `badge` class is preserved during visual transition. |
| Garage, Maintenance, and Glovebox first-run states | `EmptyState` | Vehicle, service history, registration, and insurance queries remain in app/server code. |
| Maintenance page shell/actions and add/schedule/service feedback | `Card`, `Button`, `FormMessage` | Add/import/reminder/update server actions, refs, reset effects, field markup, schedule logic, local mechanic lookup, and legacy layout classes remain in app code. |
| Glovebox page shell/actions and document/registration/insurance feedback | `Card`, `Button`, `FormMessage` | Upload actions, registration archives, policy state, app-local fields, file inputs, document ownership checks, and legacy layout classes remain in app code. |
| Vehicle profile form feedback/actions | `Button`, `FormMessage` | Vehicle update action, registration replacement `name`/`value` semantics, file input, and toggle state remain in app code. |
| Add-vehicle nested subsection panels | `Card`, `Button`, `FormMessage`, `getButtonClassName` | VIN decode, catalog selection, file input, success follow-up routing, and legacy subsection spacing remain app-owned. |
| Garage image, odometer, and profile avatar actions | `Button`, `Card`, `FormMessage` | Upload auto-submit, router refresh, odometer state, and profile action state remain in app code. |
| Storybook | All exported primitives | Static examples only; no app data imports. App-composition stories cover authenticated header/action clusters, Garage empty state, Maintenance feedback, Glovebox status, and alert variants. |

## Reusable Primitives Already Covered

Use these package primitives before adding new app-local UI wrappers:

| Need | Primitive |
| --- | --- |
| Primary, secondary, ghost, success, or danger action button | `Button` |
| Router link styled like a button | `getButtonClassName` on the app-owned link |
| Static panel, section, or article wrapper | `Card` |
| Compact status label | `Badge` |
| Label/control/help/error form unit | `Field` |
| Text, email, password, number, or date input | `Input` |
| Multi-line input | `Textarea` |
| Native option set | `Select` |
| Validation or submission feedback | `FormMessage` |
| Page title and action cluster | `PageHeader` |
| Empty list or first-run state | `EmptyState` |
| Inline success, warning, info, or error notice | `Alert` |
| Decorative or semantic rule | `Separator` |

## App-Owned Components That Should Stay Out

Keep these in `app/` or `components/` until their data contracts are plain props:

| Component or pattern | Why it stays app-owned |
| --- | --- |
| `AppShell`, `HeaderNavSlot`, `AppLogo` | Navigation, session/profile state, and app routing. |
| Vehicle, maintenance, reminder, insurance, registration, upload, and profile forms | Server actions, validation contracts, and feature-specific state. |
| Auth/onboarding workflows | Server actions, redirects, social auth callbacks, and step state. |
| Local mechanic lookup and weather badge | External fetches and user/device state. |
| Upcoming maintenance, alert lists, service history, DIY browser | Feature data fetching, filtering, and route-specific rendering. |
| File/document previews | User data ownership checks and storage adapters. |

## Transition Adapters Still In `components/ui`

These app-local wrappers intentionally remain as legacy-class adapters while the
app moves incrementally. `components/ui/button.tsx` and `components/ui/card.tsx`
were removed on 2026-06-28 after all active call sites moved to
`@my-car-pal/ui`. The remaining adapters may consume or eventually delegate to
package primitives, but do not swap them broadly until their styling differences
are reviewed in a browser.

| Adapter | Current role | Migration condition |
| --- | --- | --- |
| `components/ui/field.tsx` | Preserves label-as-wrapper form markup, field-grid classes, fieldset reset, and app form stack spacing. | Replace field groups when labels can use explicit `htmlFor`/`id` pairs and form spacing has been visually checked. |
| `components/ui/page-header.tsx` and `components/ui/section-header.tsx` | Preserve app heading class names and heading-level choices across authenticated routes. | Replace after route-level typography and spacing are reviewed against package `PageHeader`/heading primitives. |
| `components/ui/date-input-icon.tsx` | Keeps the app's existing date-input overlay icon used inside feature forms. | Move to package only if date-input adornments become a shared primitive with documented layout rules. |

## Legacy Adapter Inventory

Active call sites as of 2026-06-28:

| Legacy adapter | Active call sites | Classification | Notes |
| --- | --- | --- | --- |
| `components/ui/button.tsx` | None | Removed | All active button/link-button call sites use package `Button` or `getButtonClassName`. |
| `components/ui/card.tsx` | None | Removed | Page and subsection wrappers now use package `Card`, usually with legacy `section-card` or `subsection-card` classes retained for layout stability. |
| `components/ui/field.tsx` | `components/add-maintenance-form.tsx`, `components/add-reminder-form.tsx`, `components/add-vehicle-form.tsx`, `components/add-glovebox-document-form.tsx`, `components/glovebox-insurance-form.tsx`, `components/glovebox-registration-form.tsx`, `components/insurance-policy-form.tsx`, `components/service-history-list.tsx` | Needs visual review | These forms use app-owned server actions, file inputs, field grids, fieldsets, and label-as-wrapper markup. Migrate field groups only after explicit `htmlFor`/`id` pairs and spacing are browser-checked. |
| `components/ui/page-header.tsx` | `app/garage/page.tsx`, `app/maintenance/page.tsx`, `app/glovebox/page.tsx` | Needs visual review | Package `PageHeader` exists, but authenticated route typography/spacing should be compared before replacing legacy `page-title`/`page-subtitle` classes. |
| `components/ui/section-header.tsx` | `app/home/page.tsx`, `app/garage/page.tsx`, `app/maintenance/page.tsx`, `app/glovebox/page.tsx`, `components/add-glovebox-document-form.tsx`, `components/glovebox-registration-form.tsx`, `components/insurance-policy-form.tsx` | Should become package primitive later | Repeated heading/subtitle/action clusters suggest a future section-header or form-section primitive, but current heading-level and legacy-class contracts need visual review first. |
| `components/ui/date-input-icon.tsx` | `components/add-reminder-form.tsx`, `components/glovebox-insurance-form.tsx`, `components/glovebox-registration-form.tsx`, `components/insurance-policy-form.tsx` | Should become package primitive later | Date-input adornments are repeated, but the overlay layout should be documented before moving into the package. |
| `components/ui/class-names.ts` | Remaining adapter internals only | Should remain app-owned until adapters retire | Keep this helper local while field/header/date adapters still use it; delete it when no adapter imports it. |

## Legacy Replacement Map

Prefer these replacements when the markup is already presentational:

| Legacy app class or pattern | Replacement |
| --- | --- |
| `button.button-primary` | `<Button>` |
| `Link` or `a` styled as `button-primary` | `className={getButtonClassName()}` |
| `button.button-chip` neutral action | `<Button variant="secondary">` |
| `button.button-danger` | `<Button variant="danger">` |
| `section.section-card` with static content | `<Card as="section">` |
| `article.section-card` | `<Card as="article">` |
| `p.badge` or `span.badge` | `<Badge>` |
| `label.field > input` | `<Field label htmlFor><Input id /></Field>` |
| `label.field > textarea` | `<Field label htmlFor><Textarea id /></Field>` |
| `label.field > select` | `<Field label htmlFor><Select id /></Field>` |
| `p.form-message-error` | `<FormMessage tone="error">` |
| `p.form-message-success` | `<FormMessage tone="success">` |
| Feedback with nested follow-up action | `<FormMessage as="div">` |
| Dashed empty-state panel | `<EmptyState>` |
| Status callout or due-state note | `<Alert variant="warning" | "info" | "success" | "error">` |

## First Migration Candidates

Next low-risk surfaces:

1. Explicit `Field` migrations in the remaining feature forms, starting with
   low-risk text inputs before file/date controls.
2. Authenticated route `PageHeader` migrations after desktop/mobile spacing is
   reviewed against the package header.
3. A package section-header/form-section primitive if repeated heading and
   section-copy patterns keep duplicating across Garage, Maintenance, Glovebox,
   Profile, and DIY.
4. A package date-input adornment only after the date overlay layout is made a
   documented primitive.

Avoid broad page redesigns. Each migration should preserve route behavior,
server actions, data fetching, validation semantics, and redirects.

## Review Checklist

Before merging a migration:

- `packages/ui` has no imports from `app/`, `lib/`, Next runtime APIs, Prisma,
  Better Auth, provider SDKs, server actions, or feature fetchers.
- App behavior is unchanged: forms submit to the same actions, redirects are the
  same, and ownership checks remain in app/server code.
- Labels still point to controls with matching `htmlFor`/`id`.
- Error messages use `FormMessage tone="error"` for `role="alert"`.
- New CSS uses `--mcp-*` tokens instead of raw hex values when a token exists.
- Storybook visual smoke still passes after any primitive or token change.
