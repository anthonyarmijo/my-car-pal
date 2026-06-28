# My Car Pal Roadmap

Last updated: May 2026

## Long-Term Vision

My Car Pal is an owner-first vehicle maintenance platform for people who want clean records, practical reminders, and privacy-forward control over their vehicle history.

The long-term goal is to support the full ownership lifecycle:

- Keep maintenance records, receipts, reminders, registration, insurance, and documents organized in one place.
- Help everyday drivers, DIY owners, and households understand what needs attention next.
- Preserve trust by avoiding dealership, shop, or data-resale behavior.
- Make the product useful whether someone chooses the hosted app or a future self-hosted deployment.

## Public Repository Direction

The project may move from a private repository to a public repository when the repo is ready for public use and review.

Before that happens, the project should have:

- A clean public README and contribution guidance.
- No secrets, private environment values, or sensitive operational notes in git history or current docs.
- Clear self-hosting expectations and setup documentation.

## Self-Hosting Direction

Future self-hosting work should prioritize:

- A documented local or server deployment path.
- Environment configuration that avoids vendor lock-in where practical.
- Storage options that can work outside the hosted Vercel Blob baseline.
- Clear upgrade and migration guidance.
- Privacy-first defaults for user documents and vehicle records.

## Licensing Decision

Options to evaluate include:

The hosted product at `mycarpal.app` should remain the polished, lowest-friction version of My Car Pal.

Future hosted value may include:

- Managed backups, storage, and updates.
- Household and multi-device convenience.
- Cloud sync across web and native apps.
- Support for users who do not want to manage infrastructure.

## Native Apps

Native apps are a future direction, not a current release commitment.

Planned platform exploration:

- SwiftUI iPhone app for fast garage access, maintenance logging, reminders, document capture, and on-the-go ownership tasks.
- SwiftUI macOS app for larger-screen organization, exports, household review, and document-heavy workflows.

The native apps should share the same privacy-forward account model and sync foundation as the web app where possible.

## Sync Direction

Cross-device and cross-platform sync is a future architecture area.

The project should research:

- Sync between the hosted web app, future iPhone app, and future macOS app.
- Whether self-hosted deployments can support the same sync model or need a different local-first approach.
- Data ownership boundaries for documents, receipts, vehicle records, account data, and household sharing.
- Conflict handling for offline edits and multi-device updates.
- Provider choices for storage, push notifications, and platform-specific cloud services.

Provider decisions are intentionally not specified yet. The right architecture should be chosen after evaluating privacy, portability, operational cost, self-hosting compatibility, and user experience.
