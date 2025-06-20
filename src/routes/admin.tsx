import { createFileRoute, Outlet,  } from "@tanstack/react-router";
import { HumayBaseLayout } from "@/components/base/base";
import { protectRoute } from "@/features/auth/utils";
import { lazy } from "react";

export const Route = createFileRoute("/admin")({
  beforeLoad: ({ context }) => {
    protectRoute(context, { allowedRoles: "admin" });
  },
  component: RouteComponent
});

const Sidebar = lazy(() => import("@/features/admin/components/sidebar"));

function RouteComponent() {
  return (
    <HumayBaseLayout sidebar={Sidebar}>
      <Outlet />
    </HumayBaseLayout>
  );
}
