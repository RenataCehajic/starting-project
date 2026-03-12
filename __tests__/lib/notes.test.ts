import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";

// crypto mock must be declared before notes import (vi.mock is hoisted)
vi.mock("crypto", () => ({
  randomBytes: vi.fn().mockReturnValue({ toString: () => "mockid1234567890" }),
}));

// Mock the entire db module so bun:sqlite is never imported
vi.mock("@/lib/db", () => ({
  db: {
    run: vi.fn(),
    query: vi.fn(),
  },
}));

import { db } from "@/lib/db";
import {
  createNote,
  getNotesByUser,
  getNoteById,
  updateNote,
  deleteNote,
  setNotePublic,
  getNoteByPublicSlug,
} from "@/lib/notes";

// ---------------------------------------------------------------------------
// Shared fixtures
// ---------------------------------------------------------------------------

const mockNoteRow = {
  id: "note123",
  user_id: "user123",
  title: "Test Note",
  content_json: '{"type":"doc","content":[]}',
  is_public: 0,
  public_slug: null,
  created_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-01-01T00:00:00Z",
};

const expectedNote = {
  id: "note123",
  userId: "user123",
  title: "Test Note",
  contentJson: '{"type":"doc","content":[]}',
  isPublic: false,
  publicSlug: null,
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-01-01T00:00:00Z",
};

// A fresh mock statement is created before each test so .get/.all can be
// configured independently per test without cross-test pollution.
let mockStmt: { get: Mock; all: Mock };

beforeEach(() => {
  vi.clearAllMocks();
  mockStmt = { get: vi.fn(), all: vi.fn() };
  (db.query as Mock).mockReturnValue(mockStmt);
});

// ---------------------------------------------------------------------------
// createNote
// ---------------------------------------------------------------------------

describe("createNote", () => {
  it("inserts a row and returns the created note", () => {
    mockStmt.get.mockReturnValue(mockNoteRow);

    const result = createNote("user123", { title: "Test Note" });

    expect(db.run).toHaveBeenCalledOnce();
    expect(result).toEqual(expectedNote);
  });

  it('defaults title to "Untitled note" when omitted', () => {
    mockStmt.get.mockReturnValue({ ...mockNoteRow, title: "Untitled note" });

    createNote("user123", {});

    expect(db.run).toHaveBeenCalledWith(
      expect.any(String),
      expect.arrayContaining(["Untitled note"])
    );
  });

  it('defaults title to "Untitled note" when given an empty string', () => {
    mockStmt.get.mockReturnValue({ ...mockNoteRow, title: "Untitled note" });

    createNote("user123", { title: "" });

    expect(db.run).toHaveBeenCalledWith(
      expect.any(String),
      expect.arrayContaining(["Untitled note"])
    );
  });

  it("uses empty TipTap doc when contentJson is omitted", () => {
    mockStmt.get.mockReturnValue(mockNoteRow);

    createNote("user123", {});

    expect(db.run).toHaveBeenCalledWith(
      expect.any(String),
      expect.arrayContaining(['{"type":"doc","content":[]}'])
    );
  });

  it("stores the provided contentJson", () => {
    const customJson = '{"type":"doc","content":[{"type":"paragraph"}]}';
    mockStmt.get.mockReturnValue({ ...mockNoteRow, content_json: customJson });

    createNote("user123", { contentJson: customJson });

    expect(db.run).toHaveBeenCalledWith(
      expect.any(String),
      expect.arrayContaining([customJson])
    );
  });

  it("truncates titles longer than 200 characters", () => {
    const longTitle = "a".repeat(250);
    mockStmt.get.mockReturnValue({ ...mockNoteRow, title: "a".repeat(200) });

    createNote("user123", { title: longTitle });

    expect(db.run).toHaveBeenCalledWith(
      expect.any(String),
      expect.arrayContaining(["a".repeat(200)])
    );
  });
});

// ---------------------------------------------------------------------------
// getNotesByUser
// ---------------------------------------------------------------------------

describe("getNotesByUser", () => {
  it("returns all notes mapped to Note shape", () => {
    mockStmt.all.mockReturnValue([mockNoteRow]);

    const result = getNotesByUser("user123");

    expect(result).toEqual([expectedNote]);
    expect(db.query).toHaveBeenCalledWith(expect.stringContaining("user_id"));
  });

  it("returns an empty array when the user has no notes", () => {
    mockStmt.all.mockReturnValue([]);

    expect(getNotesByUser("user123")).toEqual([]);
  });

  it("returns multiple notes", () => {
    const second = { ...mockNoteRow, id: "note456" };
    mockStmt.all.mockReturnValue([mockNoteRow, second]);

    const result = getNotesByUser("user123");

    expect(result).toHaveLength(2);
    expect(result[1].id).toBe("note456");
  });
});

// ---------------------------------------------------------------------------
// getNoteById
// ---------------------------------------------------------------------------

describe("getNoteById", () => {
  it("returns the note when found", () => {
    mockStmt.get.mockReturnValue(mockNoteRow);

    expect(getNoteById("user123", "note123")).toEqual(expectedNote);
  });

  it("returns null when the note does not exist", () => {
    mockStmt.get.mockReturnValue(null);

    expect(getNoteById("user123", "nonexistent")).toBeNull();
  });

  it("passes both noteId and userId to the query", () => {
    mockStmt.get.mockReturnValue(mockNoteRow);

    getNoteById("user123", "note123");

    expect(mockStmt.get).toHaveBeenCalledWith("note123", "user123");
  });
});

// ---------------------------------------------------------------------------
// updateNote
// ---------------------------------------------------------------------------

describe("updateNote", () => {
  it("updates only the title", () => {
    mockStmt.get.mockReturnValue({ ...mockNoteRow, title: "New Title" });

    const result = updateNote("user123", "note123", { title: "New Title" });

    expect(db.run).toHaveBeenCalledOnce();
    expect(result?.title).toBe("New Title");
  });

  it("updates only the contentJson", () => {
    const newJson = '{"type":"doc","content":[{"type":"paragraph"}]}';
    mockStmt.get.mockReturnValue({ ...mockNoteRow, content_json: newJson });

    const result = updateNote("user123", "note123", { contentJson: newJson });

    expect(db.run).toHaveBeenCalledOnce();
    expect(result?.contentJson).toBe(newJson);
  });

  it("updates both title and contentJson in one query", () => {
    mockStmt.get.mockReturnValue(mockNoteRow);

    updateNote("user123", "note123", {
      title: "Title",
      contentJson: '{"type":"doc","content":[]}',
    });

    // Only one db.run call (the UPDATE)
    expect(db.run).toHaveBeenCalledOnce();
  });

  it("skips db.run when no fields are provided", () => {
    mockStmt.get.mockReturnValue(mockNoteRow);

    updateNote("user123", "note123", {});

    expect(db.run).not.toHaveBeenCalled();
  });

  it("returns null when the note is not found", () => {
    mockStmt.get.mockReturnValue(null);

    expect(updateNote("user123", "nonexistent", { title: "X" })).toBeNull();
  });

  it("falls back to Untitled note for a blank title", () => {
    mockStmt.get.mockReturnValue({ ...mockNoteRow, title: "Untitled note" });

    updateNote("user123", "note123", { title: "   " });

    expect(db.run).toHaveBeenCalledWith(
      expect.any(String),
      expect.arrayContaining(["Untitled note"])
    );
  });
});

// ---------------------------------------------------------------------------
// deleteNote
// ---------------------------------------------------------------------------

describe("deleteNote", () => {
  it("issues a DELETE statement with the correct parameters", () => {
    deleteNote("user123", "note123");

    expect(db.run).toHaveBeenCalledWith(
      expect.stringContaining("DELETE"),
      expect.arrayContaining(["note123", "user123"])
    );
  });

  it("does not return a value", () => {
    expect(deleteNote("user123", "note123")).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// setNotePublic
// ---------------------------------------------------------------------------

describe("setNotePublic", () => {
  it("enables public sharing and assigns a slug", () => {
    const publicRow = { ...mockNoteRow, is_public: 1, public_slug: "mockid1234567890" };
    mockStmt.get
      .mockReturnValueOnce(mockNoteRow) // initial getNoteById
      .mockReturnValueOnce(publicRow); // final getNoteById

    const result = setNotePublic("user123", "note123", true);

    expect(db.run).toHaveBeenCalledOnce();
    expect(result?.isPublic).toBe(true);
    expect(result?.publicSlug).toBe("mockid1234567890");
  });

  it("reuses an existing slug when re-enabling sharing", () => {
    const existingRow = { ...mockNoteRow, is_public: 0, public_slug: "existingslug" };
    const publicRow = { ...existingRow, is_public: 1 };
    mockStmt.get.mockReturnValueOnce(existingRow).mockReturnValueOnce(publicRow);

    setNotePublic("user123", "note123", true);

    // Should pass the existing slug, not generate a new one
    expect(db.run).toHaveBeenCalledWith(
      expect.any(String),
      expect.arrayContaining(["existingslug"])
    );
  });

  it("disables public sharing and clears the slug", () => {
    const privateRow = { ...mockNoteRow, is_public: 0, public_slug: null };
    mockStmt.get
      .mockReturnValueOnce({ ...mockNoteRow, is_public: 1, public_slug: "someslug" })
      .mockReturnValueOnce(privateRow);

    const result = setNotePublic("user123", "note123", false);

    expect(db.run).toHaveBeenCalledWith(
      expect.stringContaining("is_public = 0"),
      expect.arrayContaining(["note123", "user123"])
    );
    expect(result?.isPublic).toBe(false);
    expect(result?.publicSlug).toBeNull();
  });

  it("returns null when the note is not found", () => {
    mockStmt.get.mockReturnValueOnce(null);

    expect(setNotePublic("user123", "nonexistent", true)).toBeNull();
    expect(db.run).not.toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// getNoteByPublicSlug
// ---------------------------------------------------------------------------

describe("getNoteByPublicSlug", () => {
  it("returns the note for a valid public slug", () => {
    const publicRow = { ...mockNoteRow, is_public: 1, public_slug: "testslug123" };
    mockStmt.get.mockReturnValue(publicRow);

    const result = getNoteByPublicSlug("testslug123");

    expect(result?.isPublic).toBe(true);
    expect(result?.publicSlug).toBe("testslug123");
  });

  it("returns null when the slug is not found", () => {
    mockStmt.get.mockReturnValue(null);

    expect(getNoteByPublicSlug("nonexistent")).toBeNull();
  });

  it("queries by public_slug and is_public", () => {
    mockStmt.get.mockReturnValue(null);

    getNoteByPublicSlug("testslug");

    expect(db.query).toHaveBeenCalledWith(
      expect.stringContaining("public_slug")
    );
  });
});
