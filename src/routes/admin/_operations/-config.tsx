import { createRouteConfig } from "@/core/tanstack/router/utils";
import { FileText, Server } from "lucide-react";

export const adminOperationsGroupConfig = createRouteConfig("operations", {
  role: "admin",
  label: "Operations",
  children: [
    createRouteConfig("maintenance", {
      role: "admin",
      label: "System Maintenance",
      path: "/admin/maintenance",
      icon: Server,
      disabled: true,
    }),
    createRouteConfig("reports", {
      role: "admin",
      label: "System Reports",
      path: "/admin/reports",
      icon: FileText,
      disabled: true
    }),
  ]
})
