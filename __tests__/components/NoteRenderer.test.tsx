import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import NoteRenderer from "@/app/components/NoteRenderer";

function render(doc: object) {
  return renderToStaticMarkup(<NoteRenderer doc={doc as never} />);
}

describe("NoteRenderer", () => {
  it("renders an empty doc without crashing", () => {
    const html = render({ type: "doc", content: [] });
    expect(html).toBe('<div class="text-base"></div>');
  });

  it("renders a paragraph with text", () => {
    const html = render({
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [{ type: "text", text: "Hello world" }],
        },
      ],
    });
    expect(html).toContain("<p");
    expect(html).toContain("Hello world");
  });

  it("renders an empty paragraph with <br>", () => {
    const html = render({
      type: "doc",
      content: [{ type: "paragraph" }],
    });
    expect(html).toContain("<br");
  });

  it("renders H1 heading", () => {
    const html = render({
      type: "doc",
      content: [
        {
          type: "heading",
          attrs: { level: 1 },
          content: [{ type: "text", text: "Title" }],
        },
      ],
    });
    expect(html).toContain("<h1");
    expect(html).toContain("Title");
  });

  it("renders H2 heading", () => {
    const html = render({
      type: "doc",
      content: [
        {
          type: "heading",
          attrs: { level: 2 },
          content: [{ type: "text", text: "Section" }],
        },
      ],
    });
    expect(html).toContain("<h2");
    expect(html).toContain("Section");
  });

  it("renders H3 heading", () => {
    const html = render({
      type: "doc",
      content: [
        {
          type: "heading",
          attrs: { level: 3 },
          content: [{ type: "text", text: "Subsection" }],
        },
      ],
    });
    expect(html).toContain("<h3");
    expect(html).toContain("Subsection");
  });

  it("renders bold text", () => {
    const html = render({
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [{ type: "text", text: "bold", marks: [{ type: "bold" }] }],
        },
      ],
    });
    expect(html).toContain("<strong");
    expect(html).toContain("bold");
  });

  it("renders italic text", () => {
    const html = render({
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [{ type: "text", text: "slanted", marks: [{ type: "italic" }] }],
        },
      ],
    });
    expect(html).toContain("<em>");
    expect(html).toContain("slanted");
  });

  it("renders inline code", () => {
    const html = render({
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [{ type: "text", text: "foo()", marks: [{ type: "code" }] }],
        },
      ],
    });
    expect(html).toContain("<code");
    expect(html).toContain("foo()");
  });

  it("renders a bullet list", () => {
    const html = render({
      type: "doc",
      content: [
        {
          type: "bulletList",
          content: [
            {
              type: "listItem",
              content: [
                { type: "paragraph", content: [{ type: "text", text: "Item 1" }] },
              ],
            },
          ],
        },
      ],
    });
    expect(html).toContain("<ul");
    expect(html).toContain("<li");
    expect(html).toContain("Item 1");
  });

  it("renders a code block", () => {
    const html = render({
      type: "doc",
      content: [
        {
          type: "codeBlock",
          content: [{ type: "text", text: "const x = 1;" }],
        },
      ],
    });
    expect(html).toContain("<pre");
    expect(html).toContain("<code");
    expect(html).toContain("const x = 1;");
  });

  it("renders a horizontal rule", () => {
    const html = render({
      type: "doc",
      content: [{ type: "horizontalRule" }],
    });
    expect(html).toContain("<hr");
  });

  it("renders unknown node types as null without crashing", () => {
    const html = render({
      type: "doc",
      content: [{ type: "unknownNode", content: [] }],
    });
    expect(html).toBe('<div class="text-base"></div>');
  });

  it("ignores unknown mark types and returns plain text", () => {
    const html = render({
      type: "doc",
      content: [
        {
          type: "paragraph",
          content: [
            { type: "text", text: "plain", marks: [{ type: "unknownMark" }] },
          ],
        },
      ],
    });
    expect(html).toContain("plain");
    expect(html).not.toContain("<strong");
    expect(html).not.toContain("<em");
  });
});
