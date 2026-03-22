import { createRouteConfig } from "@/core/tanstack/router/utils";
import { DatabaseBackup, LogsIcon } from "lucide-react";

export const adminOperationsGroupConfig = createRouteConfig("operations", {
  role: "admin",
  label: "Operations",
  children: [
    createRouteConfig("logs", {
      role: "admin",
      label: "System Logs",
      path: "/admin/logs",
      icon: LogsIcon,
    }),
    createRouteConfig("backup", {
      role: "admin",
      label: "Backup",
      path: "/admin/backup",
      icon: DatabaseBackup,
    }),
  ]
})
