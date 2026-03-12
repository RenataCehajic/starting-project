export function mapAuthError(code: string | undefined): string {
  switch (code) {
    case "INVALID_EMAIL_OR_PASSWORD":
    case "USER_NOT_FOUND":
      return "Invalid email or password.";
    case "USER_ALREADY_EXISTS":
    case "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL":
      return "An account with this email already exists.";
    case "EMAIL_NOT_VERIFIED":
      return "Please verify your email address before signing in.";
    case "PASSWORD_TOO_SHORT":
      return "Password must be at least 8 characters.";
    case "INVALID_EMAIL":
      return "Please enter a valid email address.";
    default:
      return "Something went wrong. Please try again.";
  }
}
