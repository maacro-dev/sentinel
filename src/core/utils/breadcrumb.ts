import { AnyRouteMatch, ResolveParams } from "@tanstack/react-router";
import { Path } from "../tanstack/router/types";

export type CrumbMatch = AnyRouteMatch & { loaderData: { breadcrumb: CrumbLoaderDef } };
export type CrumbDef<T extends Path = Exclude<Path, "Unknown">> = {
  label: string;
  url: T;
  isDynamic: true;
  params: ResolveParams<T>;
  navigatable: boolean;
} | {
  label: string;
  url: T;
  isDynamic: false;
  navigatable: boolean;
}

export interface CrumbLoaderDef {
  breadcrumb: {
    label: string;
    navigatable?: boolean;
  }
}

export const createCrumbLoader = ({ label, navigatable = true }: { label: string; navigatable?: boolean }) => {
  return { label, navigatable };
}

export const isBreadcrumbMatch = (match: AnyRouteMatch): match is CrumbMatch => {
  return (
    typeof match.loaderData === 'object' && match.loaderData !== null && 'breadcrumb' in match.loaderData
  );
}
