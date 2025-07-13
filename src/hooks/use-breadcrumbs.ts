import { RouteBreadcrumb } from "@/lib/types";
import { useMatches } from "@tanstack/react-router";
import { useMemo } from "react";

export function useBreadcrumbs(): RouteBreadcrumb[] {
  const matches = useMatches();

  return useMemo(() =>
    matches
      .filter(match => match.staticData?.label)
      .map(match => ({
        section: match.staticData.group!,
        title: match.staticData.label!,
        url: match.pathname,
      })),
    [matches]
  );

}
