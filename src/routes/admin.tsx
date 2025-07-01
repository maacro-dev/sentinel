import { createFileRoute, Outlet, } from "@tanstack/react-router";
import { protectRoute } from "@/features/auth/utils";
import { BaseSidebar } from "@/components/layouts/base";
import { BaseLayout } from "@/components/layouts";

export const Route = createFileRoute("/admin")({
  beforeLoad: ({ context }) => {
    protectRoute(context, { allowedRoles: "admin" });
  },
  component: RouteComponent
});

function RouteComponent() {
  return (
    <BaseLayout sidebarSlot={<BaseSidebar role="admin" />}>
      <Outlet />
    </BaseLayout>
  );
}
