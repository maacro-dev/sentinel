import { routeRedirectSchema } from "@/core/tanstack/router/schema";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { LoginForm } from "@/features/authentication/components";
import { Session, useSignIn } from "@/features/authentication";
import { DEFAULT_FADE_UP } from "@/core/utils/motions";
import { getRoleRedirect } from "@features/users/utils"
import { Motion } from "@/core/components/Motion";
import { CenteredLayout } from "@/core/components/Centered";
import { LoadingScreen } from "@/core/components/LoadingScreen";

export const Route = createFileRoute("/login")({
  beforeLoad: async () => await Session.restore(),
  head: () => ({ meta: [{ title: "Login | Humay" }] }),
  validateSearch: routeRedirectSchema,
  component: RouteComponent,
});

function RouteComponent() {

  const navigate = useNavigate()
  const { signIn, isLoading } = useSignIn({
    onSignIn: async (user) => {
      await navigate({ to: getRoleRedirect(user.role), replace: true });
    },
  });

  if (isLoading) {
    return <LoadingScreen message="Hold on — we're signing you in..." />;
  }

  return (
    <CenteredLayout>
      <Motion motion={ DEFAULT_FADE_UP } className="flex-center">
        <LoginForm onSubmit={signIn} />
      </Motion>
    </CenteredLayout>
  );
}
