import { ProtectedRoute } from "@/components/protected";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import { HumayBaseLayout } from "@/components/base/base";
import AdminSidebar from "@/features/admin/components/sidebar";

export const Route = createFileRoute("/admin")({
  component: () => (
    <ProtectedRoute allowedRoles={["admin"]}>
      <HumayBaseLayout sidebar={<AdminSidebar />}>
        <Outlet />
      </HumayBaseLayout>
    </ProtectedRoute>
  )
});
