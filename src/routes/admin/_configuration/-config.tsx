import { createRouteConfig } from "@/core/tanstack/router/utils";
import { Settings } from "lucide-react";

export const adminConfigrationGroupConfig = createRouteConfig("configuration", {
  role: "admin",
  label: "Configuration",
  children: [
    createRouteConfig("settings", {
      role: "admin",
      label: "Settings",
      path: "/admin/settings",
      icon: Settings,
      disabled: true,
    }),
  ]
});
