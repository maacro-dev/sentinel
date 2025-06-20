import { Role } from "@/lib/types";
import { User } from "@/lib/types";
import { redirect } from "@tanstack/react-router";

export function roleHasAccess(role: Role, allowedRoles: Role) {
  return allowedRoles.includes(role);
}

export function getRedirectPath(role: Role) {
  switch (role) {
    case "admin":         return "/admin";
    case "data_manager":  return "/dashboard";
    default:              return "/";
  }
}

export interface RouteProtectionOptions {
  allowedRoles?:  Role;
  redirectTo?:    string;
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

  const hasAccess = user?.role && roleHasAccess(user.role, allowedRoles);

  if (!hasAccess) {
    throw redirect({ to: redirectTo || "/unauthorized" });
  }
}
