import { Role } from "@/lib/types";

export const ROLE_LABELS: Record<Role, string> = {
  admin: "Admin",
  data_manager: "Data Manager",
  data_collector: "Data Collector",
  "*": "All",
};

export const ROLE_REDIRECT_PATHS: Record<Role, string> = {
  admin: "/admin/dashboard",
  data_manager: "/dashboard",
  data_collector: "/login",
  "*": "/login",
};
