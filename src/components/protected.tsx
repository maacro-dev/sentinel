import { useAuthStore } from "@/features/auth/store/store";
import { roleHasAccess } from "@/features/auth/utils";
import { Navigate } from "@tanstack/react-router";
import { Role } from "@/lib/types";

type ProtectedRouteProps = {
  children: React.ReactNode;
  allowedRoles: Role[];
};

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  // DONT FORGET TO UNCOMMENT THIS AFTER IMPLEMENTING CORE FEATURES

  const user = useAuthStore((s) => s.user);

  if (!user || !roleHasAccess(user.role, allowedRoles)) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
}
