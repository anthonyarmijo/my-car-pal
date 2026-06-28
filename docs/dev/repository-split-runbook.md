# Repository Split Runbook

This runbook keeps the open-source split incremental and reversible.

## Tracks

| Track | Visibility | Purpose |
| --- | --- | --- |
| Public core | Public | Self-hostable app with garage, maintenance, glovebox, DIY, reminders, local auth, Postgres, Docker, and local storage |
| Private managed cloud | Private | Billing, premium entitlement rules, production deploy config, managed sync/customer operations, private roadmap, and sensitive infrastructure history |

## Phase 1: Boundary Stabilization

1. Keep code in the current repository while classifying routes, modules, scripts, docs, and schema.
2. Make local self-host defaults provider-free.
3. Remove runtime premium gates from the public core path.
4. Document private-cloud ownership for billing, production deployment, and sensitive infrastructure.
5. Update Linear issues with the boundary decision and verification result.

Exit criteria:

- Fresh checkout can run with Docker/Postgres and local file storage.
- README describes the public core first.
- Private cloud boundaries are documented.
- Known blockers are listed before any repo split.

## Phase 2: Public-Core Extraction Prep

1. Choose and document a license.
2. Add `SECURITY.md`, `CONTRIBUTING.md`, issue templates, and public support policy. Initial placeholder files are now present and need final owner review before publication.
3. Decide whether existing billing/subscription schema is removed, retained as inert legacy schema, or moved behind a private adapter.
4. Remove or rewrite private scripts from public package commands.
5. Replace private deployment docs with generic self-host docs.
6. Run secret scanning against the working tree and history.

Exit criteria:

- Public tree contains no private domains, generated env metadata, incident artifacts, credentials, or business planning.
- CI runs without private secrets.
- Local self-host verification is documented from a clean clone.

## Phase 3: Repository Creation

1. Create the public core repository from the scrubbed tree.
2. Create or update the private managed-cloud repository with excluded private paths.
3. Preserve history only if the scrub plan confirms it is safe; otherwise use a filtered import.
4. Protect `main` in both repositories before first push.
5. Add cross-repo docs that explain which track owns which behavior.

Exit criteria:

- Public repo clone passes install, migration, build, and self-host smoke checks.
- Private repo retains deploy and customer-operation continuity.
- Rollback path is known if extraction blocks launch-critical work.

## Phase 4: Verification

Run these checks for each split increment:

```bash
npm install
cp .env.example .env
npm run db:up
npx prisma migrate dev
npm run build
DATABASE_URL=postgresql://mycarpal:mycarpal_dev@localhost:55432/mycarpal?schema=public DIRECT_URL=postgresql://mycarpal:mycarpal_dev@localhost:55432/mycarpal?schema=public npm run test:security:isolation
POSTGRES_HOST_PORT=55432 docker compose build app
POSTGRES_HOST_PORT=55432 docker compose up -d app adminer
curl http://localhost:3000/api/health
```

Manual checks:

- Register a local user.
- Add a car.
- Add a motorcycle or scooter.
- Upload a glovebox document with local storage.
- Add a service log and reminder.
- Import a supported schedule.
- Confirm another user cannot access the first user's vehicle, documents, or maintenance.

Managed-cloud checks remain private and should be recorded in private issue updates, not public docs.

Latest result on 2026-05-24: build, isolation test, Docker app build, Docker app/Adminer startup, `/api/health`, and the self-host security smoke helper passed after the safe `npm audit fix` dependency lock update. The only build note was the existing landing-page `<img>` warning. `npm audit --omit=dev` still reports the Next/PostCSS advisory; the only offered fix is `npm audit fix --force`, which would install `next@9.3.3` and is not acceptable for this app.

## Current Public-Core Exclusions

Exclude or scrub these paths before creating a public repository:

- `docs/infrastructure/`
- `infra/`
- `terraform.legacy/`
- `docs/dev/pre-launch-tasks.md`
- generated provider metadata and incident artifacts
- local env files such as `.env`, `.env.local`, `.env.preview.local`, and `.vercel/`

Private Vercel env verification, prelaunch smoke, and AWS-to-Vercel cutover scripts have been removed from the shared `scripts/` tree. If they are still operationally useful, recreate or restore them only inside the private managed-cloud track.

## Billing Schema Gate (Resolved)

The public core does not carry billing or subscription tables. Managed-cloud customer, subscription, and entitlement records must stay in the private track.

## Rollback

If a split increment breaks local core behavior:

- Revert only the failing increment.
- Keep the boundary docs and issue notes that describe the failed assumption.
- Re-run the last known good self-host verification.
- Do not publish the public repo until the failure is resolved and documented.
