import { useAuthStore } from "@/features/auth/store/store";
import { User } from "@/lib/types";
import { Navigate } from "@tanstack/react-router";

type ProtectedRouteProps = {
  children: React.ReactNode;
  allowedRoles: User["role"];
};

export function ProtectedRoute({
  children,
  allowedRoles,
}: ProtectedRouteProps) {
  const user = useAuthStore((s) => s.user);
  if (!user) return <Navigate to="/login" />;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/login" />;
  }
  return <>{children}</>;
}
