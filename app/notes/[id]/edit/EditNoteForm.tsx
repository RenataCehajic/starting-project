"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useState, useRef } from "react";
import Link from "next/link";
import type { Content } from "@tiptap/core";
import type { Note } from "@/lib/notes";
import { updateNoteAction } from "@/app/actions/notes";
import EditorToolbar from "@/app/components/EditorToolbar";

type SaveStatus = "saved" | "saving" | "error";

export default function EditNoteForm({ note }: { note: Note }) {
  const [title, setTitle] = useState(note.title);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("saved");
  const titleRef = useRef(note.title);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  function scheduleSave(newTitle: string, newContentJson: string) {
    clearTimeout(saveTimer.current);
    setSaveStatus("saving");
    saveTimer.current = setTimeout(async () => {
      const result = await updateNoteAction(note.id, newTitle, newContentJson);
      setSaveStatus(result?.error ? "error" : "saved");
    }, 800);
  }

  let initialContent: Content;
  try {
    initialContent = JSON.parse(note.contentJson) as Content;
  } catch {
    initialContent = { type: "doc", content: [] };
  }

  const editor = useEditor({
    extensions: [StarterKit],
    immediatelyRender: false,
    content: initialContent,
    editorProps: {
      attributes: {
        class: "min-h-64 focus:outline-none text-sm leading-relaxed px-3 py-2",
        "aria-label": "Note content",
        "aria-multiline": "true",
        role: "textbox",
      },
    },
    onUpdate: ({ editor }) => {
      scheduleSave(titleRef.current, JSON.stringify(editor.getJSON()));
    },
  });

  function handleTitleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const newTitle = e.target.value;
    titleRef.current = newTitle;
    setTitle(newTitle);
    scheduleSave(newTitle, JSON.stringify(editor?.getJSON() ?? { type: "doc", content: [] }));
  }

  const statusText: Record<SaveStatus, string> = {
    saved: "Saved",
    saving: "Saving…",
    error: "Error saving",
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <Link
          href={`/notes/${note.id}`}
          className="text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          ← Back
        </Link>
        <span
          className={`text-xs ${
            saveStatus === "error" ? "text-red-500" : "text-gray-400 dark:text-gray-600"
          }`}
        >
          {statusText[saveStatus]}
        </span>
      </div>

      <input
        type="text"
        value={title}
        onChange={handleTitleChange}
        placeholder="Note title"
        maxLength={200}
        className="border-b border-gray-200 bg-transparent pb-3 text-3xl font-bold text-gray-900 placeholder:text-gray-300 focus:border-gray-400 focus:outline-none dark:border-gray-700 dark:text-gray-100 dark:placeholder:text-gray-700 dark:focus:border-gray-500"
      />

      <div className="overflow-hidden rounded-lg border border-gray-300 bg-white text-sm text-gray-900 focus-within:ring-2 focus-within:ring-black dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:focus-within:ring-white">
        <EditorToolbar editor={editor} />
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
