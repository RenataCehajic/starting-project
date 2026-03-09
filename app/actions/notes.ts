"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createNote, updateNote, deleteNote } from "@/lib/notes";

const MAX_TITLE_LENGTH = 200;

function isValidTiptapJson(value: string): boolean {
  try {
    const doc = JSON.parse(value);
    return doc !== null && typeof doc === "object" && doc.type === "doc";
  } catch {
    return false;
  }
}

export async function createNoteAction(
  title: string,
  contentJson: string
): Promise<{ error: string } | void> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/authenticate");

  const sanitizedTitle = title.trim().slice(0, MAX_TITLE_LENGTH);
  if (!sanitizedTitle) return { error: "Title cannot be empty." };

  if (!isValidTiptapJson(contentJson)) {
    return { error: "Note content is invalid. Please refresh and try again." };
  }

  try {
    const note = createNote(session.user.id, {
      title: sanitizedTitle,
      contentJson,
    });
    redirect(`/notes/${note.id}`);
  } catch {
    return { error: "Failed to create note. Please try again." };
  }
}

export async function updateNoteAction(
  noteId: string,
  title: string,
  contentJson: string
): Promise<{ error: string } | void> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return { error: "Not authenticated." };

  const sanitizedTitle = title.trim().slice(0, MAX_TITLE_LENGTH);
  if (!sanitizedTitle) return { error: "Title cannot be empty." };

  if (!isValidTiptapJson(contentJson)) {
    return { error: "Note content is invalid." };
  }

  try {
    const updated = updateNote(session.user.id, noteId, { title: sanitizedTitle, contentJson });
    if (!updated) return { error: "Note not found." };
  } catch {
    return { error: "Failed to save. Please try again." };
  }
}

export async function deleteNoteAction(noteId: string): Promise<{ error: string } | void> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return { error: "Not authenticated." };

  try {
    deleteNote(session.user.id, noteId);
  } catch {
    return { error: "Failed to delete note. Please try again." };
  }
}
