import Link from "next/link";
import LogoutButton from "./LogoutButton";

type User = {
  name: string;
  email: string;
};

type Props = {
  user: User | null;
};

export default function Header({ user }: Props) {
  return (
    <header className="sticky top-0 z-10 border-b border-gray-200 bg-white/90 backdrop-blur-sm dark:border-gray-800 dark:bg-gray-950/90">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link
          href="/dashboard"
          className="text-xl font-bold tracking-tight text-gray-900 transition-colors hover:text-gray-600 dark:text-white dark:hover:text-gray-300"
        >
          NextNotes
        </Link>
        {user && <LogoutButton />}
      </div>
    </header>
  );
}
