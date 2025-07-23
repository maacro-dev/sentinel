import {
  SidebarItem,
  SidebarData,
  SidebarSectionMap,
} from "./types";
import { Role } from "@/features/users";
import { RouteGroup, RouteWithStaticData } from "@/core/tanstack/router/types";
import { SIDEBAR_ORDER } from "./config";

export function getSidebarGroupRank(role: Role, group: RouteGroup) {
  return SIDEBAR_ORDER[role].indexOf(group) + 1;
}

export function groupSidebarItems(items: SidebarItem[]): SidebarData {
  const sidebarData: SidebarData = [];
  const sidebarSectionMap: Partial<SidebarSectionMap> = {};

  for (const item of items) {
    const group = item.group;
    if (!sidebarSectionMap[group]) {
      sidebarSectionMap[group] = [];
    }
    sidebarSectionMap[group].push(item);
  }

  for (const group in sidebarSectionMap) {
    const items = sidebarSectionMap[group as RouteGroup]!; // always non-null
    sidebarData.push({
      group: group as RouteGroup,
      items: items.sort((a, b) => a.order - b.order),
    });
  }

  return sidebarData;
}

export function toSidebarItem(route: RouteWithStaticData): SidebarItem {
  const {
    group,
    navItemOrder,
    label,
    icon,
    routeFor,
    disabled
  } = route.options.staticData;

  return {
    group: group,
    routeFor: routeFor,
    label: label,
    path: route.fullPath,
    icon: icon,
    order: navItemOrder,
    disabled: disabled
  };
}
