import { useCallback, useState } from "react";
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { Spinner } from "@/components/ui/spinner";
import { useAuth } from "@/context/auth-context";
import { showErrorToast, showSuccessToast } from "@/app/toast";

import CenteredLayout from "@/components/layouts/centered";

import type { UserCredentials } from "@/lib/types";
import { ROLE_REDIRECT_PATHS } from "@/app/config/roles";
import { LoginForm } from "@/components/login-form";

export const Route = createFileRoute("/(app)/login")({
  head: () => ({ meta: [{ title: "Login | Humay" }] }),
  beforeLoad: ({ context }) => {
    if (context.auth.isAuthenticated) throw redirect({ to: "/", reloadDocument: true });
  },
  component: LoginPage,
});

/**
 * 
 * TODO: Refactor this so that the loading will only be show TO LOAD THE DASHBOARD UI
 */
function LoginPage() {
  const { handleSignIn } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = useCallback(
    async (fields: UserCredentials) => {

      if (isSubmitting) return;
      setIsSubmitting(true);

      try {
        const loggedUser = await handleSignIn(fields);

        if (!loggedUser) {
          showErrorToast("Couldn't sign you in", "Please check your credentials and try again.");
          setIsSubmitting(false);
          return;
        }

        showSuccessToast(
          `Welcome back, ${loggedUser.first_name}!`,
          "You've been successfully signed in."
        );

        navigate({ to: ROLE_REDIRECT_PATHS[loggedUser.role], replace: true, reloadDocument: true });

      } catch {
        showErrorToast("Login failed", "Please check your credentials and try again.");
        setIsSubmitting(false);
      }
    },
    [handleSignIn, isSubmitting, navigate]
  );

  return (
    <CenteredLayout>
      {isSubmitting ? <LoadingState /> : <LoginForm onSubmit={handleSubmit} />}
    </CenteredLayout>
  );
}

function LoadingState() {
  return (
    <div className="flex flex-col items-center gap-4">
      <Spinner size="large" />
      <p className="text-muted-foreground">Signing you in...</p>
    </div>
  );
}
