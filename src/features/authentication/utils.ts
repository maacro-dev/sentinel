import { Role } from "@features/users";
import { MAX_IDLE_DURATION_MS } from "./config";

export const isSessionExpired = (signInTime: number | null): boolean => {
  if (signInTime == null) return true;

  const idleTimeMs = Date.now() - signInTime;
  return idleTimeMs > MAX_IDLE_DURATION_MS;
};

export function isRoleAllowed(role: Role, allowedRoles: Role) {
  return role === allowedRoles;
}
