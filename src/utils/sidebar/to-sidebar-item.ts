import { RouteWithStaticData, SidebarItem } from "@/lib/types";

export function toSidebarItem(route: RouteWithStaticData): SidebarItem {
  const { group, navItemOrder, label, icon, routeFor } = route.options.staticData;
  return {
    group: group,
    routeFor,
    label,
    path: route.fullPath,
    icon,
    order: navItemOrder,
  };
}
