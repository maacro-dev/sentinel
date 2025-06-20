import { HumayBaseLayout } from "@/components/base/base";
import { protectRoute } from "@/features/auth/utils";
import ManagerSidebar from "@/features/manager/components/sidebar";
import { Outlet, createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";

export const Route = createFileRoute("/_manager")({
  beforeLoad: ({ context }) => {
    protectRoute(context, { allowedRoles: "data_manager" });
  },
  component: () => {
    const sidebar = useMemo(() => <ManagerSidebar />, []);
    return (
      <HumayBaseLayout sidebar={sidebar}>
        <Outlet />
      </HumayBaseLayout>
    );
  }
});
