# Changelog

Notable user-facing and contributor-facing changes to the public My Car Pal application are recorded here.

## Unreleased

- Split the landing-page privacy and product-choice content into separate cards, keeping the decryption reveal exclusive to the privacy card.
- Removed the redundant Back to Home action from the Alerts page header.
- Added a live active-alert count to the Alerts item in desktop and mobile navigation.
- Removed the duplicate embedded shadow from the generic vehicle placeholder.
- Simplified registration management into a compact vehicle carousel with arrow, keyboard, and swipe navigation.
- Added a dedicated Alerts workspace with sidebar navigation, a complete active-alert list, and read or reminder controls.
- Unified the authenticated and public shells around the same landing-page car logo mark.
- Replaced the Local Mechanic location text button with a compact, accessible current-location icon.
- Fixed constrained Home alert cards so alert titles remain horizontal and actions reflow beneath the copy.
- Moved the account control into the product bar and replaced the sidebar account block with compact theme and upcoming-settings controls.
- Made the signed-in account menu dismiss when clicking elsewhere, pressing Escape, or opening profile settings.
- Removed redundant decorative calendar glyphs from date fields so each field shows a single functional date-picker icon.
- Replaced the detailed generic vehicle illustration with a quieter monochrome sedan fallback for vehicles without a photo.
- Tightened the primary-vehicle dashboard card and vehicle artwork so more of the Home workspace remains visible at a glance.
- Replaced the ambiguous mailbox symbol with a simple, consistent document icon and Glovebox label throughout the signed-in application.
- Promoted alerts and quick mileage updates above the primary vehicle, and added accessible arrow, keyboard, and swipe navigation across garage vehicles.
- Added a server-side DIY feature gate with a production Coming Soon experience and an explicit development-deployment opt-in.
- Replaced the signed-in top navigation with a responsive left sidebar and an accessible mobile drawer.
- Brought the Home dashboard closer to the landing-page product preview while preserving its more comprehensive vehicle, alert, setup, and odometer tools.
- Added an account menu with profile, theme, and logout access at every signed-in viewport size.
- Established Porcelain/graphite as the default visual direction across the application shell, shared UI tokens, authenticated workspaces, account and support pages, authentication, legal pages, and landing-page product surfaces.
- Unified route-level page introductions around the shared page-header primitive and added a reusable public information-page composition.
- Restored the landing page's cinematic full-width video opener while keeping the Porcelain content sections intentionally constrained below it.

## 1.1.0 — 2026-07-12

- Clarified the landing page's product positioning and made the hosted and self-hosted options easier to compare.
- Reorganized the product story around upcoming attention, complete vehicle records, and owner control.
- Added accessible desktop and mobile navigation with clear links to the source repository.
- Improved the landing media pipeline with a high-quality WebM source, compatible MP4 fallback, loading poster, reduced-motion behavior, and Save-Data handling.
- Refined the responsive dashboard preview and verified its light and dark presentations.
- Curated the public repository documentation around product value, self-hosting, contribution, security, and UI architecture.

## 2026-06-28

- Expanded shared UI primitives across Home, Garage, Maintenance, Glovebox, authentication, profile, and contact surfaces without moving application behavior into the UI package.
- Added rendered route checks and Storybook visual smoke coverage across desktop and mobile viewports.
- Added reusable app-composition stories for common empty, feedback, status, and action states.
- Improved form spacing and feedback presentation on authentication and account surfaces.

## 2026-06-21

- Added a structured semantic token manifest and generated JSON snapshot for `@my-car-pal/ui`.
- Added package boundary, token synchronization, package-content, TypeScript, Storybook, and route verification commands.
- Began migrating reusable cards, buttons, badges, fields, messages, alerts, and empty states into the shared UI package.
- Kept authentication, storage, database queries, server actions, and feature workflows in the application layer.

## 2026-05-31

- Added a guided welcome handoff from registration into the first-vehicle setup flow.
- Improved the signed-in shell and Home dashboard with clearer vehicle status, setup guidance, and ownership-focused navigation.

## 2026-05-24

- Published the application under the AGPL-3.0 license.
- Established Docker, PostgreSQL, local authentication, and local file storage as the default self-hosting path.
- Removed hosted-service billing gates and deployment requirements from core vehicle access.
- Added contributor, security, support, issue-template, and self-hosting documentation.
- Verified the self-hosted build, user-isolation checks, Docker image, database startup, health route, and security smoke flow.

## 2026-05-22

- Added system, light, and dark theme support across public, authentication, and signed-in application surfaces.
- Improved landing-page privacy messaging and the free one-vehicle starting path.

## 2026-04-21

- Restricted uploaded files to validated PDF, JPEG, PNG, and WebP content with file-signature checks.
- Added stored-file cleanup to replacement and deletion flows for vehicle photos, avatars, receipts, and glovebox documents.
- Added browser security headers, a report-only Content Security Policy baseline, anonymous security smoke checks, and database-backed ownership regression coverage.

## 2026-04-18

- Added first-class car and motorcycle support throughout Garage, VIN decode, and maintenance workflows.
- Added curated maintenance schedules for supported Honda, Harley-Davidson, Kawasaki, Yamaha, Suzuki, Vespa, and Piaggio motorcycles.
- Added source attribution and manual-reminder fallbacks where curated motorcycle schedules are unavailable.

## 2026-02-20

- Added authenticated contact messaging, maintenance deep links, recurring reminder intervals, improved service history, and clearer due-state messaging.
- Expanded VIN-derived drivetrain support and drivetrain-aware maintenance recommendations.
- Added vehicle-scoped registration, insurance, reminder, service, and document workflows.

## 2026-02-18

- Established the owner-scoped Garage, Maintenance, Glovebox, alerts, DIY learning center, and local mechanic lookup foundation.
- Added Better Auth email/password sessions with optional social-provider configuration.
- Added vehicle profiles, VIN decoding, odometer updates, service records, receipts, reminders, registration, insurance, and document ownership checks.
