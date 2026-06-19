import { createFileRoute } from "@tanstack/react-router";
import { AuthScreen } from "@/components/AuthScreen";

export const Route = createFileRoute("/sign-up")({
  head: () => ({
    meta: [{ title: "Sign Up · DocDNA" }],
  }),
  component: SignUpPage,
});

function SignUpPage() {
  return <AuthScreen mode="signup" />;
}
