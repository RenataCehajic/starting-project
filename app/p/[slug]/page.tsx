import { notFound } from "next/navigation";
import { getNoteByPublicSlug } from "@/lib/notes";
import NoteRenderer from "@/app/components/NoteRenderer";

export default async function PublicNotePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const note = getNoteByPublicSlug(slug);
  if (!note) notFound();

  let doc: unknown;
  try {
    doc = JSON.parse(note.contentJson);
  } catch {
    doc = { type: "doc", content: [] };
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <p className="mb-8 text-xs text-gray-400 dark:text-gray-600">Shared note · read-only</p>
      <h1 className="mb-8 text-4xl font-bold text-gray-900 dark:text-gray-100">{note.title}</h1>
      <NoteRenderer doc={doc as Parameters<typeof NoteRenderer>[0]["doc"]} />
    </main>
  );
}
