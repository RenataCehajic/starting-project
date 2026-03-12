"use client";

import { authClient } from "@/lib/auth-client";

export default function LogoutButton() {
  async function handleLogout() {
    await authClient.signOut();
    window.location.href = "/authenticate";
  }

  return (
    <button
      onClick={handleLogout}
      className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
    >
      Log out
    </button>
  );
}
