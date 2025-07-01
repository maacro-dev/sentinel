import { SIDEBAR_ORDER } from "@/app/config";
import { RouteGroup, Role } from "@/lib/types";

export function getSidebarGroupRank(role: Role, group: RouteGroup) {
  return SIDEBAR_ORDER[role].indexOf(group) + 1;
}