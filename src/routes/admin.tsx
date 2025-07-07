import { createFileRoute, Outlet, redirect, } from "@tanstack/react-router";
import { BaseSidebar } from "@/components/layouts/base";
import { BaseLayout } from "@/components/layouts";
import { useAuthStore } from "@/store/auth-store";
import { logDebugError, logPreload, logRender } from "chronicle-log";

export const Route = createFileRoute("/admin")({
  beforeLoad: async () => {
    logPreload("Admin Route");
    const user = useAuthStore.getState().user;
    if (!user) {
      logDebugError("User does not exist → redirecting to login");
      throw redirect({ to: "/login", reloadDocument: true });
    }
    if (user.role !== "admin") {
      logDebugError("User is not an admin → redirecting to unauthorized");
      throw redirect({ to: "/unauthorized", reloadDocument: true });
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  logRender("Admin Route");
  return (
    <BaseLayout sidebarSlot={<BaseSidebar role="admin" />}>
      <Outlet />
    </BaseLayout>
  );
}
