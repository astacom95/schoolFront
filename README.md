# Next.js Frontend Skeleton

This scaffold mirrors the personas and modules in the PRD. It uses the `app` router and groups routes by persona to keep Manager, Teacher, and Student experiences isolated while sharing layout and API utilities.

## Folders
- `app/` — App Router entry points.
  - `(manager)/dashboard` — Manager analytics, CRUD for teachers/students/subjects/classes, fees, payments, time tables, results.
  - `(teacher)/dashboard` — Teacher schedule, lessons (live/VOD), attendance, marks, monthly tests.
  - `(student)/dashboard` — Student schedule, lessons player, papers, tests, class activity, guidance, results.
  - `api/` — Edge-friendly API routes for health checks and future playback token signing.
- `components/` — Shared UI shells and widgets.
- `lib/` — API client, routes map, role constants, and placeholder Cloudflare integration helpers.
- `styles/` — Global styles.

## Environment (expected)
- `NEXT_PUBLIC_API_BASE_URL` — Points to Laravel API gateway.
- `NEXT_PUBLIC_CLOUDFLARE_ACCOUNT_ID` — For client-side Stream player initialization.
- `CLOUDFLARE_SIGNING_KEY` — For signed playback tokens (server side).

## Next steps
1) Run `npm install next react react-dom` (or `pnpm`/`yarn`), then `npm run dev`.
2) Flesh out pages per user stories, using the PRD modules as checklists.
3) Replace placeholder components with design system implementations and hook up to real API endpoints from the Laravel backend.
