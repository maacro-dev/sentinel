import { Path } from "@/core/tanstack/router/types";

export const INCLUDE_ADMIN = false
export const ROLE_METADATA: Record<string, {label: string, redirect: Path}> = {
  admin: {
    label: "Admin",
    redirect: "/admin/dashboard",
  },
  data_manager: {
    label: "Data Manager",
    redirect: "/dashboard",
  },
  data_collector: {
    label: "Data Collector",
    redirect: "/data_collector",
  },
  pending: {
    label: "Pending",
    redirect: "/login",
  },
} as const;
