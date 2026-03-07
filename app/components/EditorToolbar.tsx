"use client";

import type { Editor } from "@tiptap/react";

type Props = { editor: Editor | null };

type ToolbarButton = {
  label: string;
  title: string;
  onClick: () => void;
  isActive: boolean;
  icon: React.ReactNode;
};

function ToolbarBtn({
  label,
  title,
  onClick,
  isActive,
  icon,
}: ToolbarButton) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      aria-pressed={isActive}
      onClick={onClick}
      className={`flex h-8 min-w-8 items-center justify-center rounded px-1.5 text-sm transition-colors ${
        isActive
          ? "bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900"
          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100"
      }`}
    >
      {icon ?? label}
    </button>
  );
}

function Divider() {
  return (
    <span
      aria-hidden="true"
      className="mx-0.5 h-5 w-px shrink-0 bg-gray-200 dark:bg-gray-700"
    />
  );
}

export default function EditorToolbar({ editor }: Props) {
  if (!editor) return null;

  const headingLevel = editor.isActive("heading", { level: 1 })
    ? 1
    : editor.isActive("heading", { level: 2 })
      ? 2
      : editor.isActive("heading", { level: 3 })
        ? 3
        : 0;

  return (
    <div
      role="toolbar"
      aria-label="Text formatting"
      className="flex flex-wrap items-center gap-0.5 rounded-t-lg border border-b-0 border-gray-300 bg-gray-50 px-2 py-1.5 dark:border-gray-700 dark:bg-gray-800/60"
    >
      {/* Text style selector */}
      <select
        value={headingLevel}
        aria-label="Text style"
        title="Text style"
        onChange={(e) => {
          const level = Number(e.target.value);
          if (level === 0) {
            editor.chain().focus().setParagraph().run();
          } else {
            editor
              .chain()
              .focus()
              .toggleHeading({ level: level as 1 | 2 | 3 })
              .run();
          }
        }}
        className="h-8 rounded border border-gray-300 bg-white px-1.5 text-xs text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black dark:border-gray-600 dark:bg-gray-900 dark:text-gray-300 dark:focus-visible:ring-white"
      >
        <option value={0}>Paragraph</option>
        <option value={1}>Heading 1</option>
        <option value={2}>Heading 2</option>
        <option value={3}>Heading 3</option>
      </select>

      <Divider />

      {/* Bold */}
      <ToolbarBtn
        label="B"
        title="Bold (⌘B)"
        isActive={editor.isActive("bold")}
        onClick={() => editor.chain().focus().toggleBold().run()}
        icon={<strong className="text-sm font-bold">B</strong>}
      />

      {/* Italic */}
      <ToolbarBtn
        label="I"
        title="Italic (⌘I)"
        isActive={editor.isActive("italic")}
        onClick={() => editor.chain().focus().toggleItalic().run()}
        icon={<em className="text-sm italic">I</em>}
      />

      <Divider />

      {/* Bullet list */}
      <ToolbarBtn
        label="List"
        title="Bullet list"
        isActive={editor.isActive("bulletList")}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        icon={
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <line x1="8" y1="6" x2="21" y2="6" />
            <line x1="8" y1="12" x2="21" y2="12" />
            <line x1="8" y1="18" x2="21" y2="18" />
            <line x1="3" y1="6" x2="3.01" y2="6" />
            <line x1="3" y1="12" x2="3.01" y2="12" />
            <line x1="3" y1="18" x2="3.01" y2="18" />
          </svg>
        }
      />

      <Divider />

      {/* Inline code */}
      <ToolbarBtn
        label="code"
        title="Inline code (⌘E)"
        isActive={editor.isActive("code")}
        onClick={() => editor.chain().focus().toggleCode().run()}
        icon={
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <polyline points="16 18 22 12 16 6" />
            <polyline points="8 6 2 12 8 18" />
          </svg>
        }
      />

      {/* Code block */}
      <ToolbarBtn
        label="{ }"
        title="Code block"
        isActive={editor.isActive("codeBlock")}
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        icon={
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <polyline points="16 18 22 12 16 6" />
            <polyline points="8 6 2 12 8 18" />
            <line x1="12" y1="2" x2="12" y2="22" />
          </svg>
        }
      />

      <Divider />

      {/* Horizontal rule */}
      <ToolbarBtn
        label="—"
        title="Horizontal rule"
        isActive={false}
        onClick={() => editor.chain().focus().setHorizontalRule().run()}
        icon={
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <line x1="2" y1="12" x2="22" y2="12" />
          </svg>
        }
      />
    </div>
  );
}
