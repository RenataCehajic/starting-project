# Note-Taking App — Product Spec

## Product Overview

A note-taking web app where authenticated users can create rich-text notes and optionally share them publicly (and later unshare).

---

## Core User Stories

- As a user, I can sign up / sign in / sign out.
- As a user, I can create a note with a title + rich-text body.
- As a user, I can view a list of my notes, open one, edit it, and delete it.
- As a user, I can share a note publicly via a link.
- As a user, I can unshare a note (link stops working).

---

## Tech Stack

| Concern | Choice |
|---|---|
| App | Next.js (App Router), TypeScript |
| Runtime / PM | Bun |
| Styling | Tailwind CSS |
| Auth | better-auth |
| Editor | TipTap |
| DB | SQLite |
| Data format | TipTap JSON stored in SQLite (`TEXT` column with JSON string) |
| SQL | Raw SQL via Bun's SQLite client |

---

## Functional Requirements

### Authentication

- Email + password for MVP.
- Protected routes: `/app/**` requires authentication.
- Session handling:
  - Server-side session validation for route protection.
  - Client reads session for UI state.

### Notes CRUD

**Note fields:**
- `title` (string, required)
- `content` (TipTap JSON, required; empty allowed based on UX)

**Behaviors:**
- **Create note:** creates draft note and opens editor.
- **Update note:** autosave with debounce (recommended).
- **Delete note:** hard delete (MVP).

### Sharing

- Share makes note accessible at a public URL, e.g. `/share/:shareId` (random, unguessable).
- Unshare disables access — public URL returns 404 (or "Not shared" page).
- Only the owner can share/unshare.
- Public viewers are read-only.

### Rich Text Formatting

TipTap extensions enabled:
- Bold, italic
- Headings (H1–H3) + paragraph
- Inline code + code block
- Bullet list
- Horizontal rule

---

## Non-Functional Requirements

- **Performance:** note list loads < 300ms locally; editor loads fast enough for typing without lag.
- **Reliability:** no data loss during editing (autosave with visible "Saved" state).
- **Security:**
  - Strict ownership checks on every note mutation.
  - Share links should be random/non-enumerable.
  - Sanitize/escape any HTML rendering (TipTap usually renders safely if used correctly).
- **Privacy:** unshared notes must never be accessible publicly.
- Backups not required for MVP.

---

## App Structure

### Routes (Next.js App Router)

| Route | Purpose |
|---|---|
| `/` | Marketing / landing (optional) |
| `/login`, `/signup` | Auth pages (or combined `/auth`) |
| `/app` | Notes list |
| `/app/new` | Create note |
| `/app/n/:id` | Edit note |
| `/share/:shareId` | Public read-only view |

### UI Components

- `NotesSidebar` — list, create button, optional search
- `NoteEditor` — title input + TipTap editor
- `ShareButton` + share modal — copy link / unshare
- `SaveIndicator` — Saving… / Saved / Error

---

## Database Schema (SQLite)

### better-auth managed tables

better-auth creates and manages the following tables automatically:

#### `user`

| Column | Type | Notes |
|---|---|---|
| `id` | TEXT | Primary key |
| `name` | TEXT | Display name |
| `email` | TEXT | Unique, not null |
| `emailVerified` | INTEGER | Boolean (0/1) |
| `image` | TEXT | Optional avatar URL |
| `createdAt` | INTEGER | Unix timestamp |
| `updatedAt` | INTEGER | Unix timestamp |

#### `session`

| Column | Type | Notes |
|---|---|---|
| `id` | TEXT | Primary key |
| `userId` | TEXT | FK → `user.id` |
| `token` | TEXT | Unique session token |
| `expiresAt` | INTEGER | Unix timestamp |
| `ipAddress` | TEXT | Optional |
| `userAgent` | TEXT | Optional |
| `createdAt` | INTEGER | Unix timestamp |
| `updatedAt` | INTEGER | Unix timestamp |

#### `account`

| Column | Type | Notes |
|---|---|---|
| `id` | TEXT | Primary key |
| `userId` | TEXT | FK → `user.id` |
| `accountId` | TEXT | Provider-supplied account ID |
| `providerId` | TEXT | e.g. `"credential"` |
| `accessToken` | TEXT | Optional |
| `refreshToken` | TEXT | Optional |
| `accessTokenExpiresAt` | INTEGER | Optional |
| `refreshTokenExpiresAt` | INTEGER | Optional |
| `scope` | TEXT | Optional |
| `idToken` | TEXT | Optional |
| `password` | TEXT | Hashed password (email/password auth) |
| `createdAt` | INTEGER | Unix timestamp |
| `updatedAt` | INTEGER | Unix timestamp |

#### `verification`

| Column | Type | Notes |
|---|---|---|
| `id` | TEXT | Primary key |
| `identifier` | TEXT | Verification target (e.g. email) |
| `value` | TEXT | Value being verified |
| `expiresAt` | INTEGER | Unix timestamp |
| `createdAt` | INTEGER | Unix timestamp |
| `updatedAt` | INTEGER | Unix timestamp |

---

### App tables

#### `notes`

```sql
CREATE TABLE notes (
  id          TEXT    PRIMARY KEY,         -- uuid
  user_id     TEXT    NOT NULL REFERENCES user(id),
  title       TEXT    NOT NULL,
  content_json TEXT   NOT NULL,            -- TipTap JSON string
  is_shared   INTEGER NOT NULL DEFAULT 0,
  share_id    TEXT    UNIQUE,              -- random token; NULL if not shared
  created_at  INTEGER NOT NULL,
  updated_at  INTEGER NOT NULL
);

CREATE INDEX idx_notes_user_id  ON notes(user_id);
CREATE INDEX idx_notes_share_id ON notes(share_id);
```

---

## API Design (Next.js Route Handlers)

### Auth

Handled entirely by better-auth endpoints/middleware.

### Notes

| Method | Route | Description |
|---|---|---|
| GET | `/api/notes` | List notes for current user (`id`, `title`, `updated_at`, `is_shared`) |
| POST | `/api/notes` | Create note (title defaults to `"Untitled"`, empty content) |
| GET | `/api/notes/:id` | Fetch single note (owner only) |
| PUT | `/api/notes/:id` | Update title/content (owner only) |
| DELETE | `/api/notes/:id` | Delete note (owner only) |

### Sharing

| Method | Route | Description |
|---|---|---|
| POST | `/api/notes/:id/share` | Generate `share_id`, set `is_shared = 1` |
| POST | `/api/notes/:id/unshare` | Set `is_shared = 0`, clear `share_id` |

### Public

| Method | Route | Description |
|---|---|---|
| GET | `/api/share/:shareId` | Return public note (`title`, `content_json`) if `is_shared = 1` |

### Authorization Rules

- Any `/api/notes*` route requires a valid session.
- Note-specific routes: verify `notes.user_id === session.user.id`.
- Share/unshare routes: same ownership check.
- Public share fetch: must match `share_id` AND `is_shared = 1`.

**HTTP status codes:**

| Code | Meaning |
|---|---|
| 401 | Not authenticated |
| 403 | Note not owned by current user |
| 404 | Not found or unshared link |
| 400 | Validation error |

---

## Editor Storage Format

TipTap uses a JSON-based ProseMirror document format.

**Save:**
```ts
content_json = JSON.stringify(editor.getJSON())
```

**Load:**
```ts
editor.commands.setContent(JSON.parse(content_json))
```

**Autosave:**
- Debounce 600–1000ms on change.
- Optimistic UI with "Saving…" indicator.
- On error: show toast + keep local state.

---

## Error Handling

**Client:**
- Toast notifications for failures.
- Editor shows "Failed to save" state if autosave fails.

---

## Testing Plan (MVP)

### Unit
- Note ownership checks
- Share/unshare behavior

### Integration
- Create → edit → refresh → data persists
- Share link accessible without login
- Unshare makes link return 404

### Manual Smoke
- Multiple notes, switching between notes

---

## Milestones

1. Project setup (Next.js + Tailwind + Bun)
2. Auth (better-auth) + protected routes
3. SQLite schema + DB access layer
4. Notes list + create / open / delete
5. TipTap editor + save / load
6. Share / unshare + public page
7. Polish (loading states, errors, UX)
