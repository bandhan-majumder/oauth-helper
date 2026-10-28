# OAuth Buddy

An OAuth setup guide finder. Compare setup effort, approval conditions, requirements, blockers, and next steps for an app. Includes researched GitHub, Slack, and Google Drive guides, plus live research and public share links for other apps.

## Run locally

Requires Bun, Gemini API access, and PostgreSQL.

1. Run `bun install`.
2. Copy `.env.example` to `.env`; set `GEMINI_API_KEY` and `DATABASE_URL`.
3. Run `bun run db:migrate` and `bun run db:seed`.
4. Run `bun run dev`.

## Decisions and limits

- GitHub shows a direct OAuth app path; Slack shows workspace distribution versus Marketplace review; Google Drive shows scope-dependent verification.
- Developers may not need their own provider app when using managed OAuth. Custom apps can be needed for their own branding, scopes, or quota.
- Live guides use Gemini with Google Search grounding and schema validation. Generated research is not human-verified; check sources before acting.
- This demo covers three curated apps, not 100. It does not register apps or submit approvals. Review times are conditional estimates; guide links are public to anyone who has them, and checklist progress is browser-local.
