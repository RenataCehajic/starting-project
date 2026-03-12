import { describe, it, expect } from "vitest";
import { mapAuthError } from "@/lib/auth-errors";

describe("mapAuthError", () => {
  it("maps INVALID_EMAIL_OR_PASSWORD", () => {
    expect(mapAuthError("INVALID_EMAIL_OR_PASSWORD")).toBe("Invalid email or password.");
  });

  it("maps USER_NOT_FOUND to same message as invalid password", () => {
    expect(mapAuthError("USER_NOT_FOUND")).toBe("Invalid email or password.");
  });

  it("maps USER_ALREADY_EXISTS", () => {
    expect(mapAuthError("USER_ALREADY_EXISTS")).toBe(
      "An account with this email already exists."
    );
  });

  it("maps USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL", () => {
    expect(mapAuthError("USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL")).toBe(
      "An account with this email already exists."
    );
  });

  it("maps EMAIL_NOT_VERIFIED", () => {
    expect(mapAuthError("EMAIL_NOT_VERIFIED")).toBe(
      "Please verify your email address before signing in."
    );
  });

  it("maps PASSWORD_TOO_SHORT", () => {
    expect(mapAuthError("PASSWORD_TOO_SHORT")).toBe(
      "Password must be at least 8 characters."
    );
  });

  it("maps INVALID_EMAIL", () => {
    expect(mapAuthError("INVALID_EMAIL")).toBe("Please enter a valid email address.");
  });

  it("falls back to generic message for unknown codes", () => {
    expect(mapAuthError("SOME_UNKNOWN_CODE")).toBe("Something went wrong. Please try again.");
  });

  it("falls back to generic message for undefined", () => {
    expect(mapAuthError(undefined)).toBe("Something went wrong. Please try again.");
  });
});
