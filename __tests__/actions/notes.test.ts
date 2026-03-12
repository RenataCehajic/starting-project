import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";

// redirect throws like the real Next.js implementation so the function stops
// executing at the redirect call — the test then asserts on the thrown error.
vi.mock("next/navigation", () => ({
  redirect: vi.fn().mockImplementation((url: string) => {
    throw Object.assign(new Error("NEXT_REDIRECT"), { url });
  }),
}));

vi.mock("next/headers", () => ({
  headers: vi.fn().mockResolvedValue({}),
}));

vi.mock("@/lib/auth", () => ({
  auth: { api: { getSession: vi.fn() } },
}));

vi.mock("@/lib/notes", () => ({
  createNote: vi.fn(),
  updateNote: vi.fn(),
  deleteNote: vi.fn(),
  setNotePublic: vi.fn(),
}));

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { createNote, updateNote, deleteNote, setNotePublic } from "@/lib/notes";
import {
  createNoteAction,
  updateNoteAction,
  deleteNoteAction,
  toggleNotePublicAction,
} from "@/app/actions/notes";

// ---------------------------------------------------------------------------
// Shared fixtures
// ---------------------------------------------------------------------------

const mockSession = {
  user: { id: "user123", email: "test@example.com", name: "Test" },
  session: { id: "session123" },
};

const mockNote = {
  id: "noteid123",
  userId: "user123",
  title: "Test Note",
  contentJson: '{"type":"doc","content":[]}',
  isPublic: false,
  publicSlug: null,
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-01-01T00:00:00Z",
};

const validJson = '{"type":"doc","content":[]}';

// Helper: call an action and swallow the NEXT_REDIRECT error so the test can
// continue to make assertions (e.g., checking which mocks were called).
async function callAndCatchRedirect<T>(fn: () => Promise<T>) {
  try {
    return await fn();
  } catch (e: unknown) {
    if (e instanceof Error && e.message === "NEXT_REDIRECT") return undefined;
    throw e;
  }
}

// ---------------------------------------------------------------------------
// createNoteAction
// ---------------------------------------------------------------------------

describe("createNoteAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (auth.api.getSession as Mock).mockResolvedValue(mockSession);
    (createNote as Mock).mockReturnValue(mockNote);
  });

  it("redirects to /authenticate when not authenticated", async () => {
    (auth.api.getSession as Mock).mockResolvedValue(null);

    await expect(createNoteAction("Title", validJson)).rejects.toMatchObject({
      url: "/authenticate",
    });
    expect(redirect).toHaveBeenCalledWith("/authenticate");
  });

  it("returns error when title is empty", async () => {
    expect(await createNoteAction("", validJson)).toEqual({
      error: "Title cannot be empty.",
    });
  });

  it("returns error when title is only whitespace", async () => {
    expect(await createNoteAction("   ", validJson)).toEqual({
      error: "Title cannot be empty.",
    });
  });

  it("returns error when contentJson is invalid JSON", async () => {
    expect(await createNoteAction("Title", "not json")).toEqual({
      error: "Note content is invalid. Please refresh and try again.",
    });
  });

  it("returns error when contentJson has wrong type", async () => {
    expect(await createNoteAction("Title", '{"type":"paragraph"}')).toEqual({
      error: "Note content is invalid. Please refresh and try again.",
    });
  });

  it("creates note with trimmed title and redirects on success", async () => {
    await callAndCatchRedirect(() => createNoteAction("  Title  ", validJson));

    expect(createNote).toHaveBeenCalledWith("user123", {
      title: "Title",
      contentJson: validJson,
    });
    expect(redirect).toHaveBeenCalledWith("/notes/noteid123");
  });

  it("enables public sharing when isPublic is true", async () => {
    (setNotePublic as Mock).mockReturnValue({ ...mockNote, isPublic: true });

    await callAndCatchRedirect(() => createNoteAction("Title", validJson, true));

    expect(setNotePublic).toHaveBeenCalledWith("user123", "noteid123", true);
  });

  it("does not call setNotePublic when isPublic is false", async () => {
    await callAndCatchRedirect(() => createNoteAction("Title", validJson, false));

    expect(setNotePublic).not.toHaveBeenCalled();
  });

  it("returns error when createNote throws", async () => {
    (createNote as Mock).mockImplementation(() => {
      throw new Error("DB error");
    });

    expect(await createNoteAction("Title", validJson)).toEqual({
      error: "Failed to create note. Please try again.",
    });
  });
});

// ---------------------------------------------------------------------------
// updateNoteAction
// ---------------------------------------------------------------------------

describe("updateNoteAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (auth.api.getSession as Mock).mockResolvedValue(mockSession);
    (updateNote as Mock).mockReturnValue(mockNote);
  });

  it("returns error when not authenticated", async () => {
    (auth.api.getSession as Mock).mockResolvedValue(null);

    expect(await updateNoteAction("noteid", "Title", validJson)).toEqual({
      error: "Not authenticated.",
    });
  });

  it("returns error when title is empty", async () => {
    expect(await updateNoteAction("noteid", "", validJson)).toEqual({
      error: "Title cannot be empty.",
    });
  });

  it("returns error when contentJson is invalid", async () => {
    expect(await updateNoteAction("noteid", "Title", "bad")).toEqual({
      error: "Note content is invalid.",
    });
  });

  it("returns error when note is not found", async () => {
    (updateNote as Mock).mockReturnValue(null);

    expect(await updateNoteAction("noteid", "Title", validJson)).toEqual({
      error: "Note not found.",
    });
  });

  it("calls updateNote with correct args and returns void on success", async () => {
    const result = await updateNoteAction("noteid", "Title", validJson);

    expect(result).toBeUndefined();
    expect(updateNote).toHaveBeenCalledWith("user123", "noteid", {
      title: "Title",
      contentJson: validJson,
    });
  });

  it("returns error when updateNote throws", async () => {
    (updateNote as Mock).mockImplementation(() => {
      throw new Error("DB error");
    });

    expect(await updateNoteAction("noteid", "Title", validJson)).toEqual({
      error: "Failed to save. Please try again.",
    });
  });
});

// ---------------------------------------------------------------------------
// deleteNoteAction
// ---------------------------------------------------------------------------

describe("deleteNoteAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (auth.api.getSession as Mock).mockResolvedValue(mockSession);
    (deleteNote as Mock).mockReturnValue(undefined);
  });

  it("returns error when not authenticated", async () => {
    (auth.api.getSession as Mock).mockResolvedValue(null);

    expect(await deleteNoteAction("noteid")).toEqual({
      error: "Not authenticated.",
    });
  });

  it("calls deleteNote with correct args and returns void on success", async () => {
    const result = await deleteNoteAction("noteid");

    expect(result).toBeUndefined();
    expect(deleteNote).toHaveBeenCalledWith("user123", "noteid");
  });

  it("returns error when deleteNote throws", async () => {
    (deleteNote as Mock).mockImplementation(() => {
      throw new Error("DB error");
    });

    expect(await deleteNoteAction("noteid")).toEqual({
      error: "Failed to delete note. Please try again.",
    });
  });
});

// ---------------------------------------------------------------------------
// toggleNotePublicAction
// ---------------------------------------------------------------------------

describe("toggleNotePublicAction", () => {
  const publicNote = { ...mockNote, isPublic: true, publicSlug: "slug123" };

  beforeEach(() => {
    vi.clearAllMocks();
    (auth.api.getSession as Mock).mockResolvedValue(mockSession);
    (setNotePublic as Mock).mockReturnValue(publicNote);
  });

  it("returns error when not authenticated", async () => {
    (auth.api.getSession as Mock).mockResolvedValue(null);

    expect(await toggleNotePublicAction("noteid", true)).toEqual({
      error: "Not authenticated.",
    });
  });

  it("enables public sharing and returns updated note", async () => {
    const result = await toggleNotePublicAction("noteid", true);

    expect(result).toEqual({ note: publicNote });
    expect(setNotePublic).toHaveBeenCalledWith("user123", "noteid", true);
  });

  it("disables public sharing and returns updated note", async () => {
    (setNotePublic as Mock).mockReturnValue(mockNote);

    const result = await toggleNotePublicAction("noteid", false);

    expect(result).toEqual({ note: mockNote });
    expect(setNotePublic).toHaveBeenCalledWith("user123", "noteid", false);
  });

  it("returns error when note is not found", async () => {
    (setNotePublic as Mock).mockReturnValue(null);

    expect(await toggleNotePublicAction("noteid", true)).toEqual({
      error: "Note not found.",
    });
  });

  it("returns error when setNotePublic throws", async () => {
    (setNotePublic as Mock).mockImplementation(() => {
      throw new Error("DB error");
    });

    expect(await toggleNotePublicAction("noteid", true)).toEqual({
      error: "Failed to update sharing settings.",
    });
  });
});
