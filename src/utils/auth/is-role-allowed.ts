import { Role } from "@/lib/types";

export function isRoleAllowed(role: Role, allowedRoles: Role | Role[]) {

  if (Array.isArray(allowedRoles)) {
    return allowedRoles.includes(role);
  }

  return role === allowedRoles;
}