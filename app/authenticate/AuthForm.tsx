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
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-sm rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold">{isSignUp ? "Create account" : "Welcome back"}</h1>
        <p className="mt-1 mb-6 text-sm text-gray-500">
          {isSignUp ? "Sign up with your email" : "Sign in to your account"}
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium">Email</span>
            <input
              name="email"
              type="email"
              placeholder="you@example.com"
              required
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black"
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium">Password</span>
            <input
              name="password"
              type="password"
              placeholder="••••••••"
              required
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black"
            />
          </label>

          {error && (
            <p role="alert" aria-live="polite" className="text-sm text-red-600">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="mt-1 rounded-lg bg-black px-3 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {submitLabel}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-gray-500">
          {isSignUp ? (
            <>
              Already have an account?{" "}
              <Link href="/authenticate" className="font-medium text-black underline underline-offset-2">
                Sign in
              </Link>
            </>
          ) : (
            <>
              No account yet?{" "}
              <Link href="/authenticate?mode=sign-up" className="font-medium text-black underline underline-offset-2">
                Create one
              </Link>
            </>
          )}
        </p>
      </div>
    </main>
  );
}
