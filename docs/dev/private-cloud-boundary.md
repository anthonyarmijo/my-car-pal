# Private Managed-Cloud Boundary

This document defines what stays out of the public self-hostable core while My Car Pal moves into a two-track structure.

## Private Cloud Owns

- Billing routes, subscription sync, payment-provider webhooks, customer portal behavior, and premium entitlement policy.
- Managed sync and customer data operations that depend on hosted service guarantees.
- Production deployment configuration for Vercel, Neon, Vercel Blob, Cloudflare, deployment protection, bypass secrets, and private domains.
- Security-sensitive incident response, credential rotation history, generated env metadata, and rollback/audit artifacts.
- Private roadmap, pricing experiments, revenue planning, launch operations, and support workflows.
- Customer-specific logs, credentials, generated environment files, and data migration artifacts.

## Public Core Interface

The public core may expose small, generic interfaces where self-hosters need the same category of behavior:

- Storage driver selection with `FILE_STORAGE_DRIVER=local` by default and provider adapters as optional configuration.
- Optional social auth provider settings without private callback domains or managed rollout rules.
- Generic health or smoke checks that do not require Vercel deployment protection or private bearer secrets.
- A core entitlement policy that enables owner workflows locally without paid-plan gates.

## Current Repository Posture

This repository still contains historical private-cloud material during the transition. Before any public repository push:

- Move or exclude `docs/infrastructure/`, `infra/`, `terraform.legacy/`, incident artifacts, generated provider metadata, and private launch planning docs.
- Vercel env verification, prelaunch smoke, and AWS-to-Vercel cutover scripts have been removed from the core script tree; keep replacements private if those operations are still needed.
- Payment-provider runtime routes and UI have been removed from the core runtime path. Any active subscription/customer models belong in the private managed-cloud schema overlay.
- Replace managed-domain auth examples with localhost and generic self-host examples.
- Run a full secret and history audit.

## Billing Schema Decision (Resolved)

The public core does not carry billing or subscription tables. Managed-cloud customer, subscription, and entitlement records must stay out of the public repo.

## Verification Expectations

Each split increment should record:

- What changed in the public core.
- What stayed private.
- Which self-host commands were run.
- Which managed-cloud behavior was intentionally not tested in the public-core slice.
- Any Linear issue updated with the result.
