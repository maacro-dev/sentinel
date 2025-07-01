import { RouteBreadcrumb } from "@/lib/types";
import { useMatches } from "@tanstack/react-router";
import { useMemo } from "react";


export function useBreadcrumbs(): RouteBreadcrumb[] {
  const matches = useMatches();
  return useMemo(
    () =>
      matches.flatMap((match) => {
        const { group, label } = match.staticData;
        if (!label) return [];
        return {
          section: group!,
          title: label!,
          url: match.pathname,
        };
      }),
    [matches]
  );
}