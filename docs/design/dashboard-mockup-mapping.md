# Dashboard mockup mapping

## Source audit

The reference is the standalone `my-car-pal-mockups_7.html` attachment. It is
a 955-line HTML prototype with inline CSS, inline SVG iconography and vehicle
illustrations, and a small script that only swaps visible prototype panes and
maintenance tabs. It is not application code and must not be copied into the
authenticated product as-is.

- The prototype imports Google-hosted Bricolage Grotesque, Schibsted Grotesk,
  and Manrope. The product should continue to use its locally configured font
  system unless fonts are deliberately licensed and added later.
- The prototype references externally hosted Subaru and Honda photos. Those
  URLs are not used by the public app because their license and long-term
  availability are not established.
- The public landing preview uses the optimized transparent 2023 Subaru Outback
  Wilderness WebP cutout, with a PNG master, at
  `public/images/landing/vehicle-cutout-subaru-outback-wilderness.*`. It is
  derived from the separately attributed Wikimedia Commons source listed in
  `public/images/landing/README.md`; its contact shadow remains CSS-owned.
- There are no API calls, authentication, persistence, analytics, or tracking
  dependencies in the prototype. Its JavaScript is visual-only.
- Designed panes are Home, Garage, Maintenance, Glovebox, and DIY guides.
  Profile is intentionally absent.

## Route mapping for a later authenticated redesign

| Mockup pane | My Car Pal route | Existing product behavior to retain | Visual patterns worth carrying forward |
| --- | --- | --- | --- |
| Home | `/home` | User-scoped primary vehicle, alerts, maintenance totals, odometer update, activation guidance, and linked actions | Calm greeting, primary-vehicle hero, due-state rail, compact statistic cards, health and activity groups |
| Garage | `/garage` and `/vehicle/[id]` | VIN/manual vehicle creation, cars and motorcycles, image uploads, ownership checks, per-vehicle history and documents | Vehicle cards with concise metadata, primary status, due-state pill, compact specifications, separate add-vehicle card |
| Maintenance | `/maintenance` and `/maintenance/[id]` | Service logs, receipts, reminders, schedule imports/overrides, filtering, and user-scoped actions | Service-history table, segmented upcoming/history/schedule navigation, quiet filter controls, receipt state badges |
| Glovebox | `/glovebox` | Registration, insurance, uploaded documents, user-owned storage, due alerts | Document card grid, document-type icons, expiry/status pills, clear upload affordance |
| DIY guides | `/diy` and `/diy/[slug]` | Curated articles, safety and tools/resources, vehicle-independent browsing | Outcome-focused guide cards, time/difficulty/tool metadata, vehicle-context filter only when supported by real data |
| Profile | `/profile` | Existing account/profile preferences and authentication controls | No mockup was supplied; retain the current information architecture and apply shared tokens/components later |

## Reusable visual system

The supplied direction reinforces the existing Warm Scandinavian Garage
language: cream (`#F5F0E5`) workspace, porcelain (`#FFFDF7`) surfaces,
sand borders (`#E6DCC7`), warm graphite text (`#25291F`), forest primary
(`#24503B`), moss/sage positive states, and amber due states. The recurring
building blocks are a 236px soft-sage sidebar, compact top bar, 18px cards,
9px controls, pill-shaped status labels, restrained one-pixel borders, and
low-elevation shadows.

Use these as a mapping layer over the existing design tokens rather than a
parallel token system. In particular:

- Forest is for primary actions and active navigation.
- Sage communicates healthy/current states only.
- Amber communicates due/attention states only.
- Avoid turning neutral metadata or navigation into status colors.
- Vehicle art stays separate from the surface and receives its contact shadow
  from the stage, not from the image asset.

## Prototype-only concepts and constraints

The following elements are presentation concepts, not confirmed product
features, and require product/technical validation before an authenticated
redesign adopts them:

- “All changes saved” suggests managed sync. The public core must not imply
  cloud synchronization it does not provide.
- The command-key search control has no current product-wide search behavior.
- “Encrypted” document copy should not be used as a blanket claim unless it
  matches the deployed storage configuration. Continue to describe ownership
  and privacy accurately.
- “Finish one and it logs the service” for DIY guides is not a current flow.
- Export CSV, mark-done actions, document counts, and vehicle detail fields
  should be surfaced only where the existing route/action supports them.
- The mockup’s names, plates, VIN fragments, dates, expenses, and status
  counts are fictional reference data only; no preview or future seed data
  should imply a real owner or account.

## Landing preview decision

The public landing uses a code-native, non-interactive Home-pane illustration
inside the existing browser frame. It preserves responsive and dark-mode
behavior while borrowing the mockup’s navigation shell, command/search visual,
Outback hero, upcoming items, statistics, health summary, and activity feed.
The actual authenticated routes are intentionally unchanged in this pass.
