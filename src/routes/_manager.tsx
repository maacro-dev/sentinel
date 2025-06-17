import { HumayBaseLayout } from "@/components/base/base";
import { ProtectedRoute } from "@/components/protected";
import ManagerSidebar from "@/features/manager/components/sidebar";
import { Outlet, createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";

export const Route = createFileRoute("/_manager")({
  component: () => {
    const sidebar = useMemo(() => <ManagerSidebar />, []);
    return (
      <ProtectedRoute allowedRoles={["data_manager"]}>
        <HumayBaseLayout sidebar={sidebar}>
          <Outlet />
        </HumayBaseLayout>
      </ProtectedRoute>
    );
  }
});
