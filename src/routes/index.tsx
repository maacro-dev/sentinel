import { ROLE_REDIRECT_PATHS } from "@/app/config/roles";
import { useAuthStore } from "@/store/auth-store";
import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  beforeLoad: () => {
    const user = useAuthStore.getState().user;
    if (!user) {
      return redirect({ to: "/login", reloadDocument: true });
    }
    return redirect({ to: ROLE_REDIRECT_PATHS[user.role] });
  },
  component: () => null,
});
