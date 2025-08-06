import { useMatches } from "@tanstack/react-router";
import { CrumbDef, isBreadcrumbMatch } from "../utils/breadcrumb";
import { useMemo } from "react";
import { isDynamicRoute } from "../tanstack/router/utils";

export const useBreadcrumbs = (): Array<CrumbDef> => {
  const matches = useMatches()

  return useMemo(() => {
    if (matches.some((m) => m.status === 'pending')) {
      return [];
    }
    const withCrumbs = matches.filter(isBreadcrumbMatch);

    return withCrumbs.map((route) => {
      const { label, navigatable } = route.loaderData.breadcrumb;
      const url = route.fullPath;
      if (isDynamicRoute(url)) {
        const params = isDynamicRoute(url) ? route.params : undefined;
        return { label, navigatable, url, params, isDynamic: true };
      }
      return { label, navigatable, url, isDynamic: false };
    });
  }, [matches])
}
