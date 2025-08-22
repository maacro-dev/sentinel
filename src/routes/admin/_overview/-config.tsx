import { createRouteConfig } from "@/core/tanstack/router/utils";
import { Home } from "lucide-react";

export const adminOverviewGroupConfig = createRouteConfig("overview", {
  role: "admin",
  label: "Overview",
  children: [
    createRouteConfig("dashboard", {
      role: "admin",
      label: "Dashboard",
      path: "/admin/dashboard",
      icon: Home,
    }),
  ]
});
