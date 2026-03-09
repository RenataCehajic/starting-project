import { randomBytes } from "crypto";
import { db } from "./db";

export type Note = {
  id: string;
  userId: string;
  title: string;
  contentJson: string;
  isPublic: boolean;
  publicSlug: string | null;
  createdAt: string;
  updatedAt: string;
};

type NoteRow = {
  id: string;
  user_id: string;
  title: string;
  content_json: string;
  is_public: number;
  public_slug: string | null;
  created_at: string;
  updated_at: string;
};

function toNote(row: NoteRow): Note {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    contentJson: row.content_json,
    isPublic: row.is_public === 1,
    publicSlug: row.public_slug,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

const EMPTY_DOC = JSON.stringify({ type: "doc", content: [] });

export function createNote(
  userId: string,
  data: { title?: string; contentJson?: string } = {}
): Note {
  const id = randomBytes(8).toString("hex");
  const title = (data.title ?? "Untitled note").trim().slice(0, 200) || "Untitled note";
  const contentJson = data.contentJson ?? EMPTY_DOC;
  db.run(`INSERT INTO notes (id, user_id, title, content_json) VALUES (?, ?, ?, ?)`, [
    id,
    userId,
    title,
    contentJson,
  ]);
  return toNote(db.query<NoteRow, string>(`SELECT * FROM notes WHERE id = ?`).get(id)!);
}

export function getNotesByUser(userId: string): Note[] {
  return db
    .query<NoteRow, string>(`SELECT * FROM notes WHERE user_id = ? ORDER BY updated_at DESC`)
    .all(userId)
    .map(toNote);
}

export function getNoteById(userId: string, noteId: string): Note | null {
  const row = db
    .query<NoteRow, [string, string]>(`SELECT * FROM notes WHERE id = ? AND user_id = ?`)
    .get(noteId, userId);
  return row ? toNote(row) : null;
}

export function updateNote(
  userId: string,
  noteId: string,
  data: Partial<{ title: string; contentJson: string }>
): Note | null {
  const fields: string[] = [];
  const values: string[] = [];
  if (data.title !== undefined) {
    const sanitized = data.title.trim().slice(0, 200);
    fields.push("title = ?");
    values.push(sanitized || "Untitled note");
  }
  if (data.contentJson !== undefined) {
    fields.push("content_json = ?");
    values.push(data.contentJson);
  }
  if (fields.length) {
    fields.push("updated_at = datetime('now')");
    db.run(`UPDATE notes SET ${fields.join(", ")} WHERE id = ? AND user_id = ?`, [
      ...values,
      noteId,
      userId,
    ]);
  }
  return getNoteById(userId, noteId);
}

export function deleteNote(userId: string, noteId: string): void {
  db.run(`DELETE FROM notes WHERE id = ? AND user_id = ?`, [noteId, userId]);
}

export function setNotePublic(userId: string, noteId: string, isPublic: boolean): Note | null {
  const existing = getNoteById(userId, noteId);
  if (!existing) return null;
  if (isPublic) {
    const slug = existing.publicSlug ?? randomBytes(8).toString("hex");
    db.run(
      `UPDATE notes SET is_public = 1, public_slug = ?, updated_at = datetime('now') WHERE id = ? AND user_id = ?`,
      [slug, noteId, userId]
    );
  } else {
    db.run(
      `UPDATE notes SET is_public = 0, public_slug = NULL, updated_at = datetime('now') WHERE id = ? AND user_id = ?`,
      [noteId, userId]
    );
  }
  return getNoteById(userId, noteId);
}

export function getNoteByPublicSlug(slug: string): Note | null {
  const row = db
    .query<NoteRow, string>(
      `SELECT * FROM notes WHERE public_slug = ? AND is_public = 1`
    )
    .get(slug);
  return row ? toNote(row) : null;
}
