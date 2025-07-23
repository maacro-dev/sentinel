import { FileRoutesByTo } from "./routeTree.gen";
import { AnyRoute } from "@tanstack/react-router";
import { LucideIcon } from "lucide-react";
import { Role } from "@/features/users";
import { SidebarStaticData } from "@/core/components/layout/Sidebar/types";

// https://github.com/TanStack/router/discussions/824#discussioncomment-12342295
export type Path = keyof FileRoutesByTo;

export type RouteGroup
  = "Core" | "Analytics" | "Forms" | "Overview" | "Access Control" | "Operations" | "Configuration" | "*";

export type RouteWithStaticData = AnyRoute & {
  options: { staticData: SidebarStaticData }
};

export interface RouteStaticData {
  routeFor: Role;
  label: string;
  icon?: LucideIcon;
  section: RouteGroup;
  navItemOrder: number;
}

export type RouteMetadata = {
  section: RouteGroup;
  label: string;
  icon: LucideIcon;
  routeFor: Role;
  navItemOrder: number;
  showInSidebar: boolean;
  sidebarOrder: number;
};

export type RouteBreadcrumb = {
  section: RouteGroup;
  title: string;
  url: string;
};
