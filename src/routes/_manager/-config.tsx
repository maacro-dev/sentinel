import { formGroupConfig } from "./forms/-config";
import { analyticsGroupConfig } from "./_analytics/-config";
import { overviewGroupConfig } from "./_overview/-config";
import { createRouteConfig } from "@/core/tanstack/router/utils";
import { buildSidebarConfig } from "@/core/utils/sidebar";
import { dataGroupConfig } from "./_data/-config";

export const managerGroupConfig = createRouteConfig("manager", {
  role: "data_manager",
  label: "Manager",
  children: [
    overviewGroupConfig,
    analyticsGroupConfig,
    formGroupConfig,
    dataGroupConfig,
  ]
});

export const managerSidebarConfig = buildSidebarConfig(managerGroupConfig);
