import { describe, it, expect } from "vitest";
import { isValidTiptapJson } from "@/lib/tiptap";

describe("isValidTiptapJson", () => {
  it("accepts a valid empty doc", () => {
    expect(isValidTiptapJson('{"type":"doc","content":[]}')).toBe(true);
  });

  it("accepts a doc with content", () => {
    const json = JSON.stringify({
      type: "doc",
      content: [{ type: "paragraph", content: [{ type: "text", text: "Hello" }] }],
    });
    expect(isValidTiptapJson(json)).toBe(true);
  });

  it("rejects malformed JSON", () => {
    expect(isValidTiptapJson("not json at all")).toBe(false);
  });

  it("rejects an empty string", () => {
    expect(isValidTiptapJson("")).toBe(false);
  });

  it("rejects a JSON object without type:doc", () => {
    expect(isValidTiptapJson('{"type":"paragraph"}')).toBe(false);
  });

  it("rejects a JSON array", () => {
    expect(isValidTiptapJson("[]")).toBe(false);
  });

  it("rejects null literal", () => {
    expect(isValidTiptapJson("null")).toBe(false);
  });

  it("rejects a plain string value", () => {
    expect(isValidTiptapJson('"doc"')).toBe(false);
  });
});
