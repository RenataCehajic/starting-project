"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useState, useRef, useTransition } from "react";
import Link from "next/link";
import type { Content } from "@tiptap/core";
import type { Note } from "@/lib/notes";
import { updateNoteAction, toggleNotePublicAction } from "@/app/actions/notes";
import EditorToolbar from "@/app/components/EditorToolbar";

type SaveStatus = "saved" | "saving" | "error";

export default function EditNoteForm({ note }: { note: Note }) {
  const [title, setTitle] = useState(note.title);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("saved");
  const titleRef = useRef(note.title);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const [isShared, setIsShared] = useState(note.isPublic);
  const [publicSlug, setPublicSlug] = useState(note.publicSlug);
  const [shareError, setShareError] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [isSharePending, startShareTransition] = useTransition();

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

  function handleToggleShare(e: React.ChangeEvent<HTMLInputElement>) {
    const next = e.target.checked;
    setShareError(null);
    startShareTransition(async () => {
      const result = await toggleNotePublicAction(note.id, next);
      if ("error" in result) {
        setShareError(result.error);
      } else {
        setIsShared(result.note.isPublic);
        setPublicSlug(result.note.publicSlug);
      }
    });
  }

  function handleCopyLink() {
    if (!publicSlug) return;
    const url = `${window.location.origin}/p/${publicSlug}`;
    navigator.clipboard.writeText(url).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    });
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

      <div className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
        <label className="flex items-center justify-between gap-3 cursor-pointer">
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
              checked={isShared}
              onChange={handleToggleShare}
              disabled={isSharePending}
              className="sr-only peer"
              aria-label="Toggle public sharing"
            />
            <div className="w-10 h-6 rounded-full bg-gray-200 peer-checked:bg-black dark:bg-gray-700 dark:peer-checked:bg-white transition-colors peer-disabled:opacity-50" />
            <div className="absolute top-1 left-1 w-4 h-4 rounded-full bg-white dark:bg-gray-900 shadow transition-transform peer-checked:translate-x-4" />
          </div>
        </label>

        {isShared && publicSlug && (
          <div className="mt-3 flex items-center gap-2">
            <input
              readOnly
              value={`${typeof window !== "undefined" ? window.location.origin : ""}/p/${publicSlug}`}
              className="flex-1 rounded border border-gray-200 bg-gray-50 px-2 py-1.5 text-xs text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400"
            />
            <button
              type="button"
              onClick={handleCopyLink}
              className="rounded border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              {isCopied ? "Copied!" : "Copy"}
            </button>
          </div>
        )}

        {shareError && (
          <p role="alert" className="mt-2 text-xs text-red-600 dark:text-red-400">
            {shareError}
          </p>
        )}
      </div>
    </div>
  );
}
