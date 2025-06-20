import { createFileRoute, Outlet } from "@tanstack/react-router";
import { HumayBaseLayout } from "@/components/base/base";
import AdminSidebar from "@/features/admin/components/sidebar";
import { protectRoute } from "@/features/auth/utils";

export const Route = createFileRoute("/admin")({
  beforeLoad: ({ context }) => {
    protectRoute(context, { allowedRoles: "admin" });
  },
  component: () => (
    <HumayBaseLayout sidebar={<AdminSidebar />}>
      <Outlet />
    </HumayBaseLayout>
  )
});
