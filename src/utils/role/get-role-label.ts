import { ROLE_LABELS } from "@/app/config/roles";
import { Role } from "@/lib/types";

export function getRoleLabel(role: Role) {
  return ROLE_LABELS[role];
}