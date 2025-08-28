import { formGroupConfig } from "./forms/-config";
import { analyticsGroupConfig } from "./_analytics/-config";
import { overviewGroupConfig } from "./_overview/-config";
import { createRouteConfig } from "@/core/tanstack/router/utils";
import { buildSidebarConfig } from "@/core/utils/sidebar";
import { FilePlus2, Import } from "lucide-react";

export const managerGroupConfig = createRouteConfig("manager", {
  role: "data_manager",
  label: "Manager",
  children: [
    overviewGroupConfig,
    analyticsGroupConfig,
    formGroupConfig,

    // TODO: these are still just placeholder items
    createRouteConfig("data", {
      role: "data_manager",
      label: "Data",
      children: [
        createRouteConfig("import-export", {
          role: "data_manager",
          label: "Import",
          path: "/unauthorized",
          icon: Import,
          disabled: true,
        }),
        createRouteConfig("generate-mfid", {
          role: "data_manager",
          label: "MFID Generation",
          path: "/unauthorized",
          icon: FilePlus2,
          disabled: true,
        }),
      ]
    }),
  ]
});

export const managerSidebarConfig = buildSidebarConfig(managerGroupConfig);
