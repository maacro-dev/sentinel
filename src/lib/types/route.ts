import { AnyRoute } from "@tanstack/react-router";
import { LucideIcon } from "lucide-react";
import type { Role } from ".";
import type { SidebarStaticData } from "./sidebar";

export type RouteGroup
  = "Core" | "Forms" | "Overview" | "Access Control" | "Operations" | "Configuration" | "*";

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