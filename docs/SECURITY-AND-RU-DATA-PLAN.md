# TravelEk: security and Russian personal-data readiness

Status: planning document. This file is not legal advice and does not certify that the current deployment complies with Russian law.

## Current code findings (commit e61ee84)

- The application stores a user's travel diary in PostgreSQL table `diaries`, as JSON text keyed by `user_id`. `profiles` stores email, display name, and role.
- `src/lib/db.ts` selects Neon when `DATABASE_URL` is set and otherwise falls back to in-memory PGlite. PGlite is suitable for development/preview only; it must not be treated as durable production storage.
- Better Auth is configured in `src/lib/auth/server.ts`. It supports email/password and federated OAuth via an external broker. Before using accounts with Russian residents, verify which data reaches the broker and where it is processed.
- The repository was public and `src/lib/diary.functions.ts` contained a hardcoded administrator email/password and a `wipeDiariesOnce()` function that deletes every row from `diaries` if its marker is absent. Both are security/data-loss risks.
- The current app does not by itself prove which database or region is configured in the live Layero deployment. Check deployment environment and provider account before migrating.

## Immediate safety actions

1. Rotate/revoke the exposed default administrator credential wherever it may have been used. Removing it from the current source does not erase it from Git history.
2. Do not run the old `wipeDiariesOnce()` behavior against any database. Take a database backup and test restore before migration work.
3. Keep secrets only in server-side deployment secret settings. Never use `VITE_*` variables for passwords, database URLs, or server-only secrets.
4. Keep user diary records out of GitHub, static JSON, build artifacts, client logs, analytics, and public error reports.
5. Review GitHub history for additional credentials and rotate any that were exposed. History rewriting is not a substitute for rotation.

## Recommended target architecture

- Static/public catalogue data (airports, cities, countries, map geometry, translations): versioned files in GitHub; no user data.
- Frontend: Layero may continue to serve the UI only after confirming its hosting and logging terms. The frontend calls a same-origin or tightly allow-listed HTTPS API.
- API/authentication: server-side application hosted in a Russian data centre if it processes personal data of Russian citizens. Use local email/password auth or a provider whose processing and transfers have been reviewed. Avoid an external identity broker until the data flow has been assessed.
- Primary database: PostgreSQL with a contract/provider confirmation that the selected database and backups are located in Russia. Do not use the current Neon fallback as the primary store for Russian residents' personal data without a documented legal assessment.
- Backups: encrypted, access-controlled backups in Russia; defined retention; periodic restore test.
- Environments: separate development/staging/production databases and credentials. Production must not silently fall back to ephemeral PGlite.

## Data model and access control

Current minimal schema:
- `user` / `session` / `account` / `verification`: Better Auth identity/session tables.
- `profiles`: user id, email, display name, role.
- `diaries`: one JSON diary per user.

Required controls:
- Derive `user_id` only from a verified server-side session; never trust a client-supplied owner id.
- Every user-scoped query must filter by verified `user_id`.
- Admin-only endpoints must check the role server-side on every request.
- Apply request size limits, rate limiting on sign-in, secure cookie settings, HTTPS, dependency updates, and audit logging without recording passwords, tokens, or diary payloads.
- Provide a documented account deletion and diary export process. Define deletion/backup expiry so deleted data does not remain indefinitely in backups.
- Add explicit retention and access rules for IP addresses, user-agent strings, sessions, and application logs.

## Russian legal readiness checklist (verify against current law and actual data flows)

1. Identify the operator and document purposes, categories of data, data subjects, legal grounds, retention periods, and recipients/processors.
2. Assess whether a notification to Roskomnadzor is required and submit it before processing when required. Do not assume the small/private nature of the project automatically creates an exemption.
3. Publish an accessible personal-data processing policy. If consent is the chosen legal basis, collect a separate consent that is not bundled into another document; retain evidence of the version and timestamp.
4. Assess localization under Article 18(5) of Federal Law 152-FZ. For collection of personal data of Russian citizens over the internet, ensure the operations listed in the law are performed using databases in Russia, subject to statutory exceptions.
5. Map all external recipients: Layero hosting, database provider, OAuth broker, email provider, analytics, map tiles/geocoding, error monitoring, CDN, and backups. Check cross-border transfer rules and any required separate notification/assessment before enabling a transfer.
6. Implement security measures appropriate to the data and threat model, incident handling, access restriction, and the applicable Roskomnadzor notification duties for a personal-data incident.
7. Provide a contact channel for data-subject requests and a process for access, correction, consent withdrawal where applicable, and deletion.
8. Review whether map routes and visit histories can reveal a person's movements or other sensitive context; collect only what is necessary and keep profiles private by default.

Official starting points:
- Federal Law No. 152-FZ, current text: https://www.consultant.ru/document/cons_doc_LAW_61801/
- Roskomnadzor personal-data portal: https://pd.rkn.gov.ru/
- Roskomnadzor operator notification page: https://pd.rkn.gov.ru/operators-registry/notification/

## Migration plan (do not execute until the live database is identified)

1. Inspect Layero environment variable names and deployment logs without revealing secret values; identify whether `DATABASE_URL` is set and which provider/region it points to.
2. Take a consistent backup from the actual live database and restore it into a separate test instance.
3. Provision a Russian PostgreSQL instance and server-side API/auth runtime; configure secrets out of source control.
4. Migrate Better Auth tables, profiles, and diaries with row counts and checksums; verify that user IDs and foreign-key relationships remain consistent.
5. Test sign-in, sign-out, account creation, diary save/load, authorization isolation between two users, admin endpoints, deletion, and backup restore.
6. Point the production UI to the new API only after the test suite passes. Keep the old database read-only for a short, defined rollback period, then securely retire it according to the retention plan.
7. Recheck public GitHub history and repository visibility. Code can be public if desired, but never commit user data, credentials, environment files, or database dumps.

## Required production secrets

Use server-side secret settings, not committed files:
- `DATABASE_URL`: connection string to the chosen PostgreSQL instance in Russia.
- `BETTER_AUTH_URL`: exact canonical HTTPS origin of the auth/API server.
- `BETTER_AUTH_SECRET`: random, high-entropy secret.
- `TRAVELEK_ADMIN_EMAIL`, `TRAVELEK_ADMIN_PASSWORD`, optional `TRAVELEK_ADMIN_NAME`: only if the one-time admin bootstrap is intentionally used. Use a unique password of at least 12 characters, then remove bootstrap credentials after provisioning if the deployment process allows it.

Do not enable production accounts until the actual deployment is confirmed to use durable storage, the database region and external data flows are reviewed, and backup/restore has been tested.
