import { useCallback, useState } from "react";
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { showToast } from "@/app/toast";
import { CenteredLayout } from "@/components/layouts";
import { ROLE_REDIRECT_PATHS } from "@/app/config/roles";
import { LoginForm } from "@/components/login-form";
import { useAuthStore } from "@/store/auth-store";
import type { UserCredentials } from "@/lib/types";
import { logDebugOk, logOk, logPreload } from "chronicle-log";
import { LoadingScreen } from "@/components/loading-screen";

export const Route = createFileRoute("/login")({
  beforeLoad: async () => {
    logPreload("Login Route");
    const user  = useAuthStore.getState().user;
    if (user) {
      logDebugOk("User is already logged in → redirecting to home");
      throw redirect({ to: ROLE_REDIRECT_PATHS[user.role] });
    }
  },
  head: () => ({ meta: [{ title: "Login | Humay" }] }),
  component: LoginPage,
});

function LoginPage() {

  const navigate = useNavigate();
  const handleSignIn = useAuthStore((state) => state.handleSignIn);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = useCallback(
    async (fields: UserCredentials) => {

      setIsLoading(true);
      const result = await handleSignIn(fields);

      if (!result.ok) {
        showToast({
          type: "error",
          message: "Couldn't sign you in",
          description: result.error?.message ?? "Unknown error",
        });
        setIsLoading(false)
        return;
      }

      logOk("Signed in successfully");

      const user = result.data;
      await navigate({ to: ROLE_REDIRECT_PATHS[user.role], replace: true });

      showToast({
        type: "success",
        message: `Welcome back, ${user.first_name}!`,
        description: "You've been successfully signed in.",
      });

      setIsLoading(false);
    },
    [handleSignIn, navigate]
  );

  if (isLoading) {
    return <LoadingScreen message="Hold on — we're signing you in..." />;
  }

  return (
    <CenteredLayout>
      <LoginForm onSubmit={handleSubmit} />
    </CenteredLayout>
  );
}
