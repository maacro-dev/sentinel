import { BaseLayout } from "@/components/layouts";
import { BaseSidebar } from "@/components/base";
import { protectRoute } from "@/features/auth/utils";
import { Outlet, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_manager")({
  beforeLoad: ({ context }) => {
    protectRoute(context, { allowedRoles: "data_manager" });
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
