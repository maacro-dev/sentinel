import { redirect } from "@tanstack/react-router";

import type { Role, User } from "@/lib/types";
import { isRoleAllowed } from "@/utils/auth/is-role-allowed";

export function getRedirectPath(role: Role) {
  switch (role) {
    case "admin":
      return "/admin/dashboard";
    case "data_manager":
      return "/dashboard";
    default:
      return "/";
  }
}

export interface RouteProtectionOptions {
  allowedRoles?: Role;
  redirectTo?: string;
}

export function protectRoute(
  context: { auth: { isAuthenticated: boolean; user: User | null } },
  options: RouteProtectionOptions = {}
) {
  const { isAuthenticated, user } = context.auth;
  const { allowedRoles, redirectTo } = options;

  if (!isAuthenticated) {
    throw redirect({ to: redirectTo || "/login" });
  }

  if (!allowedRoles) {
    return;
  }

  const hasAccess = user?.role && isRoleAllowed(user.role, allowedRoles);

  if (!hasAccess) {
    throw redirect({ to: redirectTo || "/unauthorized", reloadDocument: true });
  }
}
