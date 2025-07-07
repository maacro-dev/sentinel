import { BaseLayout } from "@/components/layouts";
import { BaseSidebar } from "@/components/layouts/base";
import { useAuthStore } from "@/store/auth-store";
import { logDebugCheck, logDebugError } from "chronicle-log";
import { Outlet, createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_manager")({
  beforeLoad: async () => {
    const user = useAuthStore.getState().user;
    logDebugCheck(`User: ${user ? "exists" : "does not exist"}`);
    if (!user) {
      logDebugError("User does not exist → redirecting to login");
      throw redirect({ to: "/login" });
    }
    if (user.role !== "data_manager") {
      logDebugError("User is not a data manager → redirecting to unauthorized");
      throw redirect({ to: "/unauthorized" });
    }
  },
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <BaseLayout sidebarSlot={<BaseSidebar role="data_manager" />}>
      <Outlet />
    </BaseLayout>
  );
}
