import AuthForm from "./AuthForm";

type Props = {
  searchParams: Promise<{ mode?: string }>;
};

export default async function AuthenticatePage({ searchParams }: Props) {
  const { mode } = await searchParams;
  return <AuthForm isSignUp={mode === "sign-up"} />;
}
