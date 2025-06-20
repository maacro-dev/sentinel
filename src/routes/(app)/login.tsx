import { useCallback, useState } from "react";
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import CenteredLayout from "@/components/layouts/centered";
import { Spinner } from "@/components/ui/spinner";
import { useAuth } from "@/context/auth-context";
import LoginForm from "@/features/auth/components/login-form";
import type { UserCredentials } from "@/features/auth/schema/schema";
import { showErrorToast, showSuccessToast } from "@/app/toast";
import { getRedirectPath } from "@/features/auth/utils";

export const Route = createFileRoute("/(app)/login")({
  head: () => ({ meta: [{ title: "Login | Humay" }] }),
  beforeLoad: ({ context }) => {
    if (context.auth.isAuthenticated) throw redirect({ to: "/" });
  },
  component: LoginPage,
});

function LoginPage() {
  const { handleLogin } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = useCallback(
    async (fields: UserCredentials) => {
      if (isSubmitting) return;
      setIsSubmitting(true);

      try {
        const { data: user, error } = await handleLogin(fields);

        if (error || !user) {
          showErrorToast(
            "Couldn't sign you in",
            error?.message ||
              "Please check your email and password and try again."
          );
          return;
        }

        showSuccessToast(
          `Welcome back, ${user.firstName}!`,
          "You've been successfully signed in."
        );
        navigate({ to: getRedirectPath(user.role) });
      } catch (err) {
        const message =
          err instanceof Error
            ? `We encountered an issue: ${err.message}`
            : "Something went wrong. Please try again in a moment.";
        showErrorToast("Login failed", message);
      } finally {
        setIsSubmitting(false);
      }
    },
    [handleLogin, isSubmitting, navigate]
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
