import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getNotesByUser } from "@/lib/notes";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/authenticate");

  const notes = getNotesByUser(session.user.id);

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Your Notes</h1>
        <Link
          href="/notes/new"
          className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-100"
        >
          New Note
        </Link>
      </div>

      {notes.length === 0 ? (
        <p className="mt-16 text-center text-gray-400 dark:text-gray-500">
          No notes yet.{" "}
          <Link
            href="/notes/new"
            className="text-black underline underline-offset-2 hover:text-gray-600 dark:text-white dark:hover:text-gray-300"
          >
            Create your first one.
          </Link>
        </p>
      ) : (
        <ul className="mt-6 space-y-3" aria-label="Notes list">
          {notes.map((note) => (
            <li key={note.id}>
              <Link
                href={`/notes/${note.id}`}
                className="block rounded-xl border border-gray-200 bg-white p-4 transition-shadow hover:border-gray-300 hover:shadow-sm dark:border-gray-800 dark:bg-gray-900 dark:hover:border-gray-700"
              >
                <p className="font-medium text-gray-900 dark:text-gray-100">{note.title}</p>
                <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                  {new Date(note.updatedAt).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
