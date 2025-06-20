import { useAuth } from "@/context/auth-context";
import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { role } = useAuth();
  switch (role) {
    case "admin":
      return <Navigate to="/admin/dashboard" />;
    case "data_manager":
      return <Navigate to="/dashboard" />;
    default:
      return <Navigate to="/login" />;
  }
}
