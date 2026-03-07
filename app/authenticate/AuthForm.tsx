"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";

type Props = {
  isSignUp: boolean;
};

export default function AuthForm({ isSignUp }: Props) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const email = form.get("email") as string;
    const password = form.get("password") as string;

    setError(null);
    setPending(true);

    if (isSignUp) {
      await authClient.signUp.email(
        { email, password, name: email },
        {
          onSuccess: () => router.push("/dashboard"),
          onError: (ctx) => setError(ctx.error.message),
        }
      );
    } else {
      await authClient.signIn.email(
        { email, password },
        {
          onSuccess: () => router.push("/dashboard"),
          onError: (ctx) => setError(ctx.error.message),
        }
      );
    }

    setPending(false);
  }

  const submitLabel = pending ? "Please wait…" : isSignUp ? "Create account" : "Sign in";

  return (
    <main className="flex flex-1 items-center justify-center bg-gray-50 px-4 py-12 dark:bg-gray-950">
      <div className="w-full max-w-sm rounded-xl border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
          {isSignUp ? "Create account" : "Welcome back"}
        </h1>
        <p className="mb-6 mt-1 text-sm text-gray-500 dark:text-gray-400">
          {isSignUp ? "Sign up with your email" : "Sign in to your account"}
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Email</span>
            <input
              name="email"
              type="email"
              placeholder="you@example.com"
              required
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-600 dark:focus-visible:ring-white"
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Password</span>
            <input
              name="password"
              type="password"
              placeholder="••••••••"
              required
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-600 dark:focus-visible:ring-white"
            />
          </label>

          {error && (
            <p role="alert" aria-live="polite" className="text-sm text-red-600 dark:text-red-400">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="mt-1 rounded-lg bg-black px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-gray-100"
          >
            {submitLabel}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-gray-500 dark:text-gray-400">
          {isSignUp ? (
            <>
              Already have an account?{" "}
              <Link
                href="/authenticate"
                className="font-medium text-black underline underline-offset-2 dark:text-white"
              >
                Sign in
              </Link>
            </>
          ) : (
            <>
              No account yet?{" "}
              <Link
                href="/authenticate?mode=sign-up"
                className="font-medium text-black underline underline-offset-2 dark:text-white"
              >
                Create one
              </Link>
            </>
          )}
        </p>
      </div>
    </main>
  );
}
