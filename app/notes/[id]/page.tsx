import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { getNoteById } from "@/lib/notes";
import NoteRenderer from "@/app/components/NoteRenderer";
import DeleteNoteButton from "@/app/components/DeleteNoteButton";

export default async function NoteViewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/authenticate");

  const { id } = await params;
  const note = getNoteById(session.user.id, id);
  if (!note) notFound();

  let doc: unknown;
  try {
    doc = JSON.parse(note.contentJson);
  } catch {
    doc = { type: "doc", content: [] };
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-8 flex items-center justify-between">
        <Link
          href="/dashboard"
          className="text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          ← Back
        </Link>
        <div className="flex items-center gap-3">
          <p className="text-xs text-gray-400 dark:text-gray-600">
            Last updated{" "}
            {new Date(note.updatedAt).toLocaleDateString(undefined, {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </p>
          <Link
            href={`/notes/${id}/edit`}
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            Edit
          </Link>
          <DeleteNoteButton noteId={id} />
        </div>
      </div>

      {note.isPublic && note.publicSlug && (
        <div className="mb-6 flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 dark:border-gray-700 dark:bg-gray-800/50">
          <span className="text-xs text-gray-500 dark:text-gray-400 shrink-0">Public link:</span>
          <span className="flex-1 truncate text-xs text-gray-700 dark:text-gray-300">
            {appUrl}/p/{note.publicSlug}
          </span>
          <Link
            href={`/notes/${id}/edit`}
            className="shrink-0 text-xs text-gray-500 underline hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            Manage
          </Link>
        </div>
      )}

      <h1 className="mb-8 text-4xl font-bold text-gray-900 dark:text-gray-100">{note.title}</h1>

      <NoteRenderer doc={doc as Parameters<typeof NoteRenderer>[0]["doc"]} />
    </main>
  );
}
