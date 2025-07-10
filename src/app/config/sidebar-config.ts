import { Role, RouteGroup } from "@/lib/types";

export const SIDEBAR_ORDER: Record<Role, RouteGroup[]> = {
  admin: ["Overview", "Access Control", "Operations", "Configuration"],
  data_collector: ["Overview", "Forms"],
  data_manager: [],
  pending: [],
};
