import { ProtectedRoute } from "@/components/protected";
import DashboardPage from "@/features/dashboard/dashboard-page";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard/")({
  component: () => (
    <ProtectedRoute allowedRoles="data_manager">
      <DashboardPage />
    </ProtectedRoute>
  ),
});
