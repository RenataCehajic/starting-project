"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createNote, updateNote, deleteNote, setNotePublic, type Note } from "@/lib/notes";
import { isValidTiptapJson } from "@/lib/tiptap";

const MAX_TITLE_LENGTH = 200;

export async function createNoteAction(
  title: string,
  contentJson: string,
  isPublic?: boolean
): Promise<{ error: string } | void> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/authenticate");

  const sanitizedTitle = title.trim().slice(0, MAX_TITLE_LENGTH);
  if (!sanitizedTitle) return { error: "Title cannot be empty." };

  if (!isValidTiptapJson(contentJson)) {
    return { error: "Note content is invalid. Please refresh and try again." };
  }

  let noteId: string;
  try {
    const note = createNote(session.user.id, {
      title: sanitizedTitle,
      contentJson,
    });
    if (isPublic) {
      setNotePublic(session.user.id, note.id, true);
    }
    noteId = note.id;
  } catch {
    return { error: "Failed to create note. Please try again." };
  }
  redirect(`/notes/${noteId}`);
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

export async function toggleNotePublicAction(
  noteId: string,
  isPublic: boolean
): Promise<{ error: string } | { note: Note }> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return { error: "Not authenticated." };

  try {
    const updated = setNotePublic(session.user.id, noteId, isPublic);
    if (!updated) return { error: "Note not found." };
    return { note: updated };
  } catch {
    return { error: "Failed to update sharing settings." };
  }
}
