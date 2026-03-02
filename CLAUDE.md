# CLAUDE.md

We're builing the app described in @SPEC.MD. Read that file for general architectural tasks or to double-check the exact database structure, tech stack or application architecture.

Keep your replies extremely concise and focus on conveying the key information. No unnecessary fluff, no long code snippets.

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
bun dev          # start dev server (http://localhost:3000)
bun build        # production build
bun lint         # run ESLint
```

All package management uses **Bun** — never use npm, yarn, or pnpm.

## Environment

Copy `.env.example` to `.env.local` and fill in values:

- `BETTER_AUTH_SECRET` — must be 32+ characters
- `BETTER_AUTH_URL` — full base URL (e.g. `http://localhost:3000`)
- `DB_PATH` — path to SQLite file (e.g. `./database.db`)

## Architecture

This is a **Next.js App Router** app (TypeScript). The `@/*` path alias maps to the project root.

### Auth (`lib/auth.ts`, `lib/auth-client.ts`)

- **Server-side:** `auth` from `lib/auth.ts` — used in Route Handlers and Server Components
- **Client-side:** `authClient` from `lib/auth-client.ts` — used in Client Components
- better-auth manages its own tables (`user`, `session`, `account`, `verification`) in SQLite automatically
- All `/app/**` routes are protected by `proxy.ts` via `getSessionCookie`

### Database (`lib/db.ts`)

- Single shared `bun:sqlite` `Database` instance exported from `lib/db.ts`
- better-auth uses this same instance for its managed tables
- App tables use raw SQL — no ORM
- Schema for `notes` table (see `SPEC.MD`): `id`, `user_id`, `title`, `content_json` (TipTap JSON string), `is_shared`, `share_id`, `created_at`, `updated_at`

### API Routes (`app/api/`)

- `app/api/auth/[...all]/route.ts` — catch-all handled entirely by better-auth
- Notes CRUD: `GET/POST /api/notes`, `GET/PUT/DELETE /api/notes/:id`
- Sharing: `POST /api/notes/:id/share`, `POST /api/notes/:id/unshare`
- Public: `GET /api/share/:shareId`
- All `/api/notes*` routes require a valid session; ownership is verified on every mutation

### Route Structure

| Route               | Purpose                    |
| ------------------- | -------------------------- |
| `/`                 | Landing page               |
| `/authenticate`     | Auth page (sign-in/sign-up)|
| `/app`              | Notes list (protected)     |
| `/app/n/:id`        | Note editor (protected)    |
| `/share/:shareId`   | Public read-only note view |

### Editor

- TipTap with StarterKit + extensions (bold, italic, headings H1–H3, inline code, code block, bullet list, horizontal rule)
- Content stored as TipTap JSON string in `content_json` column
- Autosave with 600–1000ms debounce; UI shows Saving… / Saved / Error states
