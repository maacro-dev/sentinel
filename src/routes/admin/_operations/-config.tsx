import { createRouteConfig } from "@/core/tanstack/router/utils";
import { DatabaseBackup } from "lucide-react";
import { Shield, Activity } from 'lucide-react';

export const adminOperationsGroupConfig = createRouteConfig("operations", {
  role: "admin",
  label: "Operations",
  children: [
    createRouteConfig("audit-logs", {
      role: "admin",
      label: "System Audit",
      path: "/admin/audit-logs",
      icon: Shield,
    }),
    createRouteConfig("activity-logs", {
      role: "admin",
      label: "Activity Logs",
      path: "/admin/activity-logs",
      icon: Activity,
    }),
    createRouteConfig("backup", {
      role: "admin",
      label: "Backup",
      path: "/admin/backup",
      icon: DatabaseBackup,
    }),
  ]
});
