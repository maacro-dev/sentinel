import { RouteGroup } from "@/core/tanstack/router/types";
import { Role } from "@/features/users";

export const SIDEBAR_ORDER: Record<Role, RouteGroup[]> = {
  admin: ["Overview", "Access Control", "Operations", "Configuration"],
  data_manager: ["Overview", "Analytics", "Forms"],
  data_collector: [],
  pending: [],
};
