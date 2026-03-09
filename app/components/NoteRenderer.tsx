import { Fragment, type ReactNode } from "react";

type Mark = { type: string };

type TiptapNode = {
  type: string;
  text?: string;
  marks?: Mark[];
  attrs?: Record<string, unknown>;
  content?: TiptapNode[];
};

function applyMarks(content: ReactNode, marks: Mark[]): ReactNode {
  return marks.reduce((node, mark) => {
    switch (mark.type) {
      case "bold":
        return <strong className="font-semibold">{node}</strong>;
      case "italic":
        return <em>{node}</em>;
      case "code":
        return (
          <code className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-sm text-gray-800 dark:bg-gray-800 dark:text-gray-200">
            {node}
          </code>
        );
      default:
        return node;
    }
  }, content);
}

function renderNode(node: TiptapNode, index: number): ReactNode {
  const children = node.content?.map((child, i) => renderNode(child, i)) ?? null;

  switch (node.type) {
    case "doc":
      return <>{children}</>;

    case "paragraph":
      return (
        <p key={index} className="mb-4 leading-7 text-gray-700 last:mb-0 dark:text-gray-300">
          {children ?? <br />}
        </p>
      );

    case "heading": {
      const level = (node.attrs?.level as number) ?? 1;
      if (level === 1)
        return (
          <h1 key={index} className="mb-4 mt-8 text-3xl font-bold text-gray-900 first:mt-0 dark:text-gray-100">
            {children}
          </h1>
        );
      if (level === 2)
        return (
          <h2 key={index} className="mb-3 mt-7 text-2xl font-semibold text-gray-900 first:mt-0 dark:text-gray-100">
            {children}
          </h2>
        );
      return (
        <h3 key={index} className="mb-2 mt-6 text-xl font-semibold text-gray-900 first:mt-0 dark:text-gray-100">
          {children}
        </h3>
      );
    }

    case "bulletList":
      return (
        <ul key={index} className="mb-4 list-disc space-y-1 pl-6 text-gray-700 last:mb-0 dark:text-gray-300">
          {children}
        </ul>
      );

    case "orderedList":
      return (
        <ol key={index} className="mb-4 list-decimal space-y-1 pl-6 text-gray-700 last:mb-0 dark:text-gray-300">
          {children}
        </ol>
      );

    case "listItem":
      return <li key={index}>{children}</li>;

    case "codeBlock":
      return (
        <pre key={index} className="mb-4 overflow-x-auto rounded-lg bg-gray-100 p-4 last:mb-0 dark:bg-gray-800/80">
          <code className="font-mono text-sm text-gray-800 dark:text-gray-200">{children}</code>
        </pre>
      );

    case "horizontalRule":
      return <hr key={index} className="my-6 border-gray-200 dark:border-gray-700" />;

    case "text": {
      const text = node.text ?? "";
      const content = node.marks?.length ? applyMarks(text, node.marks) : text;
      return <Fragment key={index}>{content}</Fragment>;
    }

    default:
      return null;
  }
}

export default function NoteRenderer({ doc }: { doc: TiptapNode }) {
  return <div className="text-base">{renderNode(doc, 0)}</div>;
}
