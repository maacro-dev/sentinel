import { createRouteConfig } from "@/core/tanstack/router/utils";
import { IdCard, LayoutDashboard } from "lucide-react";

export const overviewGroupConfig = createRouteConfig("overview", {
  role: "data_manager",
  label: "Overview",
  children: [
    createRouteConfig("dashboard", {
      role: "data_manager",
      label: "Dashboard",
      path: "/dashboard",
      icon: LayoutDashboard,
    }),
    createRouteConfig("monitored_fields", {
      role: "data_manager",
      label: "Fields",
      path: "/monitored_fields",
      icon: IdCard,
    }),
  ]
});
