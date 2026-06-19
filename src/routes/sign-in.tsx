import { createFileRoute } from "@tanstack/react-router";
import { AuthScreen } from "@/components/AuthScreen";

export const Route = createFileRoute("/sign-in")({
  head: () => ({
    meta: [{ title: "Sign In · DocDNA" }],
  }),
  component: SignInPage,
});

function SignInPage() {
  return <AuthScreen mode="signin" />;
}
