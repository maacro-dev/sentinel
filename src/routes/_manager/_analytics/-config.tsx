import { createRouteConfig } from "@/core/tanstack/router/utils";
import { ChartArea, GitCompare, TrendingUpDown } from "lucide-react";

export const analyticsGroupConfig = createRouteConfig("analytics",{
  role: "data_manager",
  label: "Analytics",
  children: [
    createRouteConfig("descriptive", {
      role: "data_manager",
      label: "Descriptive",
      path: "/descriptive",
      icon: ChartArea,
      disabled: true
    }),
    createRouteConfig("comparative", {
      role: "data_manager",
      label: "Comparative",
      path: "/comparative",
      icon: GitCompare,
      disabled: true
    }),
    createRouteConfig("predictive", {
      role: "data_manager",
      label: "Predictive",
      path: "/predictive",
      icon: TrendingUpDown,
      disabled: true
    }),
  ]
});
