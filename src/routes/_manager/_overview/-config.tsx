import { createRouteConfig } from "@/core/tanstack/router/utils";
import { FormInput, LayoutDashboard } from "lucide-react";

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
    createRouteConfig({
      role: "data_manager",
      label: "Data Collection",
      path: "/forms-overview",
      icon: FormInput,
    }),
  ]
});
