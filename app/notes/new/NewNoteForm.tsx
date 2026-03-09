"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useState, useTransition } from "react";
import { createNoteAction } from "@/app/actions/notes";
import EditorToolbar from "@/app/components/EditorToolbar";

export default function NewNoteForm() {
  const [title, setTitle] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const editor = useEditor({
    extensions: [StarterKit],
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: "min-h-40 focus:outline-none text-sm leading-relaxed px-3 py-2",
        "aria-label": "Note content",
        "aria-multiline": "true",
        role: "textbox",
      },
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const contentJson = JSON.stringify(
      editor?.getJSON() ?? { type: "doc", content: [] }
    );
    startTransition(async () => {
      const result = await createNoteAction(title.trim(), contentJson);
      if (result?.error) setError(result.error);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Title</span>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Note title"
          required
          autoFocus
          maxLength={200}
          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:placeholder:text-gray-600 dark:focus-visible:ring-white"
        />
      </label>

      <div className="flex flex-col gap-1.5">
        <span
          id="content-label"
          className="text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          Content
        </span>
        <div
          aria-labelledby="content-label"
          className="overflow-hidden rounded-lg border border-gray-300 bg-white text-sm text-gray-900 focus-within:ring-2 focus-within:ring-black dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:focus-within:ring-white"
        >
          <EditorToolbar editor={editor} />
          <EditorContent editor={editor} />
        </div>
      </div>

      {error && (
        <p role="alert" aria-live="polite" className="text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={isPending || !title.trim()}
          className="rounded-lg bg-black px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-gray-100"
        >
          {isPending ? "Creating…" : "Create Note"}
        </button>
        <a
          href="/dashboard"
          className="text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          Cancel
        </a>
      </div>
    </form>
  );
}
