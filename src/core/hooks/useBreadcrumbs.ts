import { useMatches } from "@tanstack/react-router";
import { useMemo } from "react";
import { RouteBreadcrumb } from "@/core/tanstack/router/types";

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
