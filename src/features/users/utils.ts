import { ROLE_METADATA } from "./config";
import { Role } from "./schemas";

export function getRoleLabel(role: Role): string {
  return ROLE_METADATA[role].label;
}

export function getRoleRedirect(role: Role): string {
  return ROLE_METADATA[role].redirect;
}

export function formatRole(role: string) {
  return role.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}
