import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-4 py-24 text-center">
      <h1 className="text-5xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
        NextNotes
      </h1>
      <p className="mt-4 max-w-md text-lg text-gray-500 dark:text-gray-400">
        A clean, fast note-taking app. Write rich-text notes and share them with anyone.
      </p>
      <div className="mt-8 flex gap-3">
        <Link
          href="/authenticate?mode=sign-up"
          className="rounded-lg bg-black px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-100"
        >
          Get started
        </Link>
        <Link
          href="/authenticate"
          className="rounded-lg border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
        >
          Sign in
        </Link>
      </div>
    </main>
  );
}
