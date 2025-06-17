import { useCallback } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Spinner } from "@/components/ui/spinner";
import { useSignIn } from "../api/useSignIn";
import { useAuthStore } from "../store/store";
import { LoginFields } from "../schema/schema";
import { User } from "@/lib/types";
import { getRedirectPath } from "../utils";

import LoginForm from "./login-form";
import CenteredLayout from "@/components/layouts/centered";

const LoginPage = () => {
  const navigate = useNavigate();
  const setUser = useAuthStore((state) => state.setUser);
  const { mutate: signIn, isPending, isSuccess, error } = useSignIn();

  const handleSubmit = useCallback(
    (loginFields: LoginFields) => {
      signIn(loginFields, {
        onSuccess: (loggedUser: User) => {
          setUser(loggedUser);
          navigate({ to: getRedirectPath(loggedUser.role) });
        },
      });
    },
    [signIn]
  );

  // loading state
  if (isPending || isSuccess) {
    return (
      <CenteredLayout>
        <Spinner size="large" />
      </CenteredLayout>
    );
  }

  // login form
  return (
    <CenteredLayout>
      <LoginForm onSubmit={handleSubmit} />
      {error && (
        <p className="text-destructive text-sm mt-2">{error?.message}</p>
      )}
    </CenteredLayout>
  );
};

export default LoginPage;
