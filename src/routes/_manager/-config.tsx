import { formGroupConfig } from "./forms/-config";
import { analyticsGroupConfig } from "./_analytics/-config";
import { overviewGroupConfig } from "./_overview/-config";
import { createRouteConfig } from "@/core/tanstack/router/utils";
import { buildSidebarConfig } from "@/core/utils/sidebar";
import { dataGroupConfig } from "./_data/-config";
import { Computer } from "lucide-react";

const developmentRoutes = import.meta.env.DEV
  ? [
      createRouteConfig("development", {
        role: "data_manager",
        label: "Development",
        children: [
          createRouteConfig("sandbox", {
            role: "data_manager",
            label: "Sandbox",
            path: "/sandbox",
            icon: Computer,
          }),
        ],
      }),
    ]
  : [];

export const managerGroupConfig = createRouteConfig("manager", {
  role: "data_manager",
  label: "Manager",
  children: [
    overviewGroupConfig,
    analyticsGroupConfig,
    formGroupConfig,
    dataGroupConfig,
    ...developmentRoutes,
  ],
});

export const managerSidebarConfig = buildSidebarConfig(managerGroupConfig);
