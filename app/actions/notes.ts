"use server";

import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createNote } from "@/lib/notes";

export async function createNoteAction(title: string, contentJson: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/authenticate");

  const note = createNote(session.user.id, { title, contentJson });
  redirect(`/notes/${note.id}`);
}
