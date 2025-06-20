import { groupOrderMap } from "@/lib/constants";
import {
  SidebarDataGroup,
  SidebarDataItem,
  RouteGroup,
  RouteMetadata,
} from "@/lib/types";
import { useRouter } from "@tanstack/react-router";
import { useMemo } from "react";
import { Role } from "@/lib/schemas/user";

export function useSidebarData(role: Role) {
  const { routesByPath } = useRouter();

  return useMemo(() => {
    const groupsMap = new Map<
      RouteGroup,
      { items: (SidebarDataItem & { itemOrder: number })[]; groupOrder: number }
    >();

    Object.values(routesByPath).forEach((route) => {
      const metadata = route.options.staticData?.metadata as RouteMetadata | undefined;

      if (
        metadata?.sidebarOptions?.showInSidebar &&
        route.fullPath &&
        (metadata.for === role || metadata.for === "*")
      ) {
        const group = metadata.group;
        const groupOrder = groupOrderMap[group] ?? 999;
        const itemOrder = metadata.sidebarOptions.order ?? 999;

        const item: SidebarDataItem & { itemOrder: number } = {
          title: metadata.title,
          icon: metadata.icon,
          url: route.fullPath,
          itemOrder
        };

        if (!groupsMap.has(group)) {
          groupsMap.set(group, { items: [], groupOrder });
        }

        groupsMap.get(group)!.items.push(item);
      }
    });

    const groupedSidebarData: SidebarDataGroup[] = Array.from(groupsMap.entries())
      .sort((a, b) => a[1].groupOrder - b[1].groupOrder)
      .map(([title, { items }]) => ({
        title,
        items: items
          .sort((a, b) => a.itemOrder - b.itemOrder)
          .map(({ ...rest }) => rest)
      }));

    return groupedSidebarData;
  }, [role, routesByPath]);
}
