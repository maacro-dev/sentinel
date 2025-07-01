import { RouteWithStaticData } from "@/lib/types";
import { AnyRoute } from "@tanstack/react-router";

export function hasValidStaticData(route: AnyRoute): route is RouteWithStaticData {
  const staticData = route.options.staticData;
  return !!(
    staticData?.group &&
    staticData?.navItemOrder != null &&
    staticData?.routeFor &&
    staticData?.label &&
    staticData?.icon
  );
}