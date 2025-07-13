import { Role, RouteGroup } from "@/lib/types";

export const SIDEBAR_ORDER: Record<Role, RouteGroup[]> = {
  admin: ["Overview", "Access Control", "Operations", "Configuration"],
  data_manager: ["Overview", "Analytics", "Forms"],
  data_collector: [],
  pending: [],
};
