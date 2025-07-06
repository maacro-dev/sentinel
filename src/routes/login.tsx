import { useCallback, useState } from "react";
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { Spinner } from "@/components/ui/spinner";
import { showErrorToast, showSuccessToast } from "@/app/toast";
import { CenteredLayout } from "@/components/layouts";
import { ROLE_REDIRECT_PATHS } from "@/app/config/roles";
import { LoginForm } from "@/components/login-form";
import { log } from "@/utils";
import { useAuthStore } from "@/store/auth-store";
import type { UserCredentials } from "@/lib/types";
import { logDebugOk, logOk, logPreload } from "@/utils/log";

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

  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const handleSignIn = useAuthStore((state) => state.handleSignIn);

  const handleSubmit = useCallback(
    async (fields: UserCredentials) => {

      if (isSubmitting) return;
      setIsSubmitting(true);
      const result = await handleSignIn(fields);

      if (!result.ok) {
        showErrorToast(
          "Couldn't sign you in",
          result.error?.message ?? "Unknown error"
        );
        setIsSubmitting(false);
        return;
      }

      logOk("Signed in successfully");

      const user = result.data;
      showSuccessToast(
        `Welcome back, ${user.first_name}!`,
        "You've been successfully signed in."
      );
      navigate({ to: ROLE_REDIRECT_PATHS[user.role], replace: true });
    },
    [handleSignIn, isSubmitting, navigate]
  );


  log("RENDER", `${isSubmitting ? "LoadingSpinner" : "LoginPage"}`);
  return (
    <CenteredLayout>
      {isSubmitting ? (
        <div className="flex flex-col items-center gap-4">
          <Spinner size="large" />
          <p className="text-muted-foreground">Signing you in...</p>
        </div>
      ) : (
        <LoginForm onSubmit={handleSubmit} />
      )}
    </CenteredLayout>
  );
}
