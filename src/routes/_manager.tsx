import { HumayBaseLayout } from "@/components/base/base";
import { protectRoute } from "@/features/auth/utils";
import { Outlet, createFileRoute } from "@tanstack/react-router";
import { lazy } from "react";

export const Route = createFileRoute("/_manager")({
  beforeLoad: ({ context }) => {
    protectRoute(context, { allowedRoles: "data_manager" });
  },
  component: RouteComponent,
});

const Sidebar = lazy(() => import("@/features/manager/components/sidebar"));

function RouteComponent() {
  return (
    <HumayBaseLayout sidebar={Sidebar}>
      <Outlet />
    </HumayBaseLayout>
  );
}
