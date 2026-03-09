"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useState, useTransition } from "react";
import { createNoteAction } from "@/app/actions/notes";
import EditorToolbar from "@/app/components/EditorToolbar";

export default function NewNoteForm() {
  const [title, setTitle] = useState("");
  const [isPublic, setIsPublic] = useState(false);
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
      const result = await createNoteAction(title.trim(), contentJson, isPublic);
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

      <label className="flex items-center justify-between gap-3 rounded-lg border border-gray-200 p-4 cursor-pointer dark:border-gray-700">
        <div>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Public sharing
          </span>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Anyone with the link can view this note
          </p>
        </div>
        <div className="relative">
          <input
            type="checkbox"
            checked={isPublic}
            onChange={(e) => setIsPublic(e.target.checked)}
            className="sr-only peer"
            aria-label="Enable public sharing"
          />
          <div className="w-10 h-6 rounded-full bg-gray-200 peer-checked:bg-black dark:bg-gray-700 dark:peer-checked:bg-white transition-colors" />
          <div className="absolute top-1 left-1 w-4 h-4 rounded-full bg-white dark:bg-gray-900 shadow transition-transform peer-checked:translate-x-4" />
        </div>
      </label>

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
