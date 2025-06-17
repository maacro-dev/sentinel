import { useAuthStore } from "@/features/auth/store/store";
import { createFileRoute, Navigate, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  beforeLoad: () => {
    const user = useAuthStore.getState().user;
    if (!user) throw redirect({ to: "/login" });
  },
  component: () => <Navigate to="/dashboard" />,
});
