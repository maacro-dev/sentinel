import { SidebarNode } from "@/core/components/layout/Sidebar/types";
import { RouteConfig } from "@/core/tanstack/router/types";
import { isDynamicRoute } from "../tanstack/router/utils";

//* This works only on the immediate children of the passed route config.

export function buildSidebarConfig(root: RouteConfig): SidebarNode[] {
  const buildNode = (cfg: RouteConfig): SidebarNode => {
    const baseNode = {
      id: cfg.id ?? crypto.randomUUID(),
      label: cfg.label,
      icon: cfg.icon,
      disabled: cfg.disabled ?? false,
      path: cfg.path || "/unauthorized",
      children: cfg.children?.map(buildNode) ?? [],
    };

    return isDynamicRoute(cfg.path || "") && cfg.params
      ? { ...baseNode, isDynamic: true, params: cfg.params }
      : { ...baseNode, isDynamic: false };
  };

  return root.children?.map(buildNode) ?? [];
}
