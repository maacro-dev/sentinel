import { BaseLayout } from "@/components/layouts";
import { BaseSidebar } from "@/components/layouts/base";
import { useAuthStore } from "@/store/auth-store";
import { log } from "@/utils";
import { Outlet, createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_manager")({
  beforeLoad: async () => {
    const user = useAuthStore.getState().user;
    log("CHECK", `User: ${user ? "exists" : "does not exist"}`);
    if (!user) {
      log("ERROR", "User does not exist → redirecting to login");
      throw redirect({ to: "/login" });
    }
    if (user.role !== "data_manager") {
      log("ERROR", "User is not a data manager → redirecting to unauthorized");
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
