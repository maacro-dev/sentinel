import { RouteGroup, SidebarData, SidebarItem, SidebarSectionMap } from "@/lib/types";

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