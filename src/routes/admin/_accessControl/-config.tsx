import { createRouteConfig } from "@/core/tanstack/router/utils";
import { Shield, Users } from "lucide-react";

export const adminAccessControlGroupConfig = createRouteConfig("accessControl", {
  role: "admin",
  label: "Access Control",
  children: [
    createRouteConfig("user-management", {
      role: "admin",
      label: "User Management",
      path: "/admin/user-management",
      icon: Users
    }),
    createRouteConfig("security", {
      role: "admin",
      label: "System Security",
      path: "/admin/security",
      icon: Shield
    }),
  ]
});
