import { Role } from "@/lib/types";

export const ROLE_IDS: Record<Role, number> = {
  admin: 1,
  data_manager: 2,
  data_collector: 3,
  pending: -1,
};

export const ROLE_LABELS: Record<Role, string> = {
  admin: "Admin",
  data_manager: "Data Manager",
  data_collector: "Data Collector",
  pending: "Pending",
};

export const ROLE_REDIRECT_PATHS: Record<Role, string> = {
  admin: "/admin/dashboard",
  data_manager: "/dashboard",
  data_collector: "/data_collector",
  pending: "/login",
};
