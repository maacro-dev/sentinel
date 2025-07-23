import { useMemo } from "react";
import { useRouter } from "@tanstack/react-router";
import {
  toSidebarItem,
  groupSidebarItems,
  getSidebarGroupRank
} from "@/core/components/layout/Sidebar/utils";
import { hasValidStaticData } from "@/core/tanstack/router/utils";

import type {
  SidebarData,
  SidebarSection
} from "@/core/components/layout/Sidebar";
import type { Role } from "@/features/users";


export function useSidebarData({ sidebarFor }: { sidebarFor: Role }): SidebarData {
  const { flatRoutes } = useRouter();

  return useMemo(() => {
    const accessibleItems = flatRoutes
      .filter(hasValidStaticData)
      .map(toSidebarItem)
      .filter(sidebarItem => sidebarItem.routeFor === sidebarFor);

    const groupedItems = groupSidebarItems(accessibleItems);

    return groupedItems.sort(function(a: SidebarSection, b: SidebarSection) {
      return getSidebarGroupRank(sidebarFor, a.group) - getSidebarGroupRank(sidebarFor, b.group)
    }
    );
  }, [sidebarFor]);
}
