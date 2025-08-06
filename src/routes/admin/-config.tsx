import { createRouteConfig } from "@/core/tanstack/router/utils";
import { adminOverviewGroupConfig } from "./_overview/-config";
import { adminOperationsGroupConfig } from "./_operations/-config";
import { adminConfigrationGroupConfig } from "./_configuration/-config";
import { adminAccessControlGroupConfig } from "./_accessControl/-config";
import { buildSidebarConfig } from "@/core/utils/sidebar";

export const adminGroupConfig = createRouteConfig("admin", {
  role: "admin",
  label: "Admin",
  children: [
    adminOverviewGroupConfig,
    adminAccessControlGroupConfig,
    adminOperationsGroupConfig,
    adminConfigrationGroupConfig,
  ]
});

export const adminSidebarConfig = buildSidebarConfig(adminGroupConfig);
