import { ProtectedRoute } from "@/components/protected";
import AdminPage from "@/features/admin/admin-page";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/")({
  component: () => (
    <ProtectedRoute allowedRoles="admin">
      <AdminPage />
    </ProtectedRoute>
  ),
});
