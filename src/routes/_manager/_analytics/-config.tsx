import { createRouteConfig } from "@/core/tanstack/router/utils";
import { ChartArea, GitCompare, Library, TrendingUpDown } from "lucide-react";

export const analyticsGroupConfig = createRouteConfig("analytics", {
  role: "data_manager",
  label: "Analytics",
  children: [
    createRouteConfig("forms", {
      role: "data_manager",
      label: "Forms",
      path: "/forms",
      icon: Library,
    }),
    createRouteConfig("descriptive", {
      role: "data_manager",
      label: "Descriptive",
      path: "/descriptive",
      icon: ChartArea,
    }),
    createRouteConfig("comparative", {
      role: "data_manager",
      label: "Comparative",
      path: "/comparative",
      icon: GitCompare,
    }),
    createRouteConfig("predictive", {
      role: "data_manager",
      label: "Predictive",
      path: "/predictive",
      icon: TrendingUpDown,
    }),
  ]
});
