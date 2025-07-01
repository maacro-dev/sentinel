import { useMemo } from "react";
import { useRouter } from "@tanstack/react-router";

import {
  hasValidStaticData,
  toSidebarItem,
  isRoleAllowed,
  groupSidebarItems,
  getSidebarGroupRank,
} from "@/utils";

import type { Role, SidebarData } from "@/lib/types";

/**
 * Returns a structured and filtered sidebar configuration based on the user's role.
 *
 * 1. Processes the available routes, filters them based on defined static data in routes.
 * 2. Groups them into sidebar sections.
 * 3. Sorts the groups based on role-specific rank.
 * 4. Returns a sorted array of {@link SidebarData} for rendering the sidebar.
 *
 * @param role - The current user's role.
 * @returns A sorted array of {@link SidebarData} for rendering the sidebar.
 */
export function useSidebarData(role: Role): SidebarData {
  const { flatRoutes } = useRouter();

  return useMemo(() => {
    const accessibleItems = flatRoutes
      .filter(hasValidStaticData)
      .map(toSidebarItem)
      .filter(item => isRoleAllowed(item.routeFor, role));


    const groupedItems = groupSidebarItems(accessibleItems);

    return groupedItems.sort(
      (a, b) => getSidebarGroupRank(role, a.group) - getSidebarGroupRank(role, b.group)
    );
  }, [role, flatRoutes]);
}
