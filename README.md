# OAuth Buddy

OAuth Buddy helps developers understand the work, waiting time, and handoffs involved in setting up an OAuth app. It includes a small researched guide library and can research an unfamiliar app and save a shareable guide.

## Local setup

Requirements: Bun, a Gemini API key, and a PostgreSQL database.

1. Install packages with `bun install`.
2. Copy `.env.example` to `.env` and set `GEMINI_API_KEY` and `DATABASE_URL` for your PostgreSQL instance. Keep real credentials out of Git.
3. Apply the Prisma migration: `bun run db:migrate`.
4. Seed the three researched guide records: `bun run db:seed`.
5. Start the app with `bun run dev`.

For schema changes, update `prisma/schema.prisma`, then run `bun run db:migrate` to create and apply a development migration. Deploy existing migrations with `bun run db:migrate:deploy`. The Prisma client is generated from the schema during install/build workflows; run `bun run db:generate` after schema edits if you need to regenerate it separately.

## Product decisions

- The existing responsive docs-style shell remains, but its navigation and center area now serve an OAuth app directory and guide reader.
- The first three guides cover GitHub, Slack, and Google Drive. These were selected to show different permission models, distribution choices, and conditional verification requirements.
- Each guide separates hands-on estimates from external review wait, assigns steps to the agent or developer, tracks local checklist progress, and links to its evidence.
- Generated guides first check whether official sources document third-party OAuth app registration. If no public path is found or support is unclear, the guide says so, withholds setup and approval estimates, and starts with provider confirmation rather than invented registration steps.
- The assistant is scoped to OAuth setup and, on a guide page, receives that guide’s steps and sources as context.
- Unknown apps are researched with Gemini and Google Search grounding, validated against a shared Zod schema, and saved to PostgreSQL via Prisma before a public, unlisted `/guides/[slug]` link is returned.
- Managed OAuth is called out separately: some integration platforms supply the provider OAuth app, so a developer may not need to register their own unless they need custom scopes, branding, or quota.

## Evidence and limitations

GitHub, Slack, and Google Drive guides were checked against official public documentation by parallel research agents on 2026-10-28. They inspected setup documentation and flows but did not create provider apps, sign in, test callbacks, submit a marketplace listing, or request verification; those actions need developer accounts and live application details.

Review times depend on app scopes, audience, distribution, and provider review. The guides mark hands-on durations as estimates and state when a provider publishes no general estimate. Generated guides show returned grounded web sources and mark uncertain details; generated research has not been manually verified by a human.

This is a take-home slice, not the planned 100-app directory. It does not create OAuth apps, store provider credentials, submit approvals, or automate provider dashboard actions. Share links are public to anyone who has the unlisted URL. Checklist progress stays in the visitor’s browser.

## Checks

Run `bun run lint` and `bun run build`. In this environment, if Turbopack cannot start its CSS subprocess, run the production check with `bunx next build --webpack`.
