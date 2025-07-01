import type { LucideIcon } from "lucide-react";
import type { RouteGroup } from "./route";
import type { Role } from "./user";

export interface SidebarStaticData {
  group: RouteGroup;
  navItemOrder: number;
  label: string;
  icon: LucideIcon;
  routeFor: Role;
}

export type SidebarData = SidebarSection[];

export type SidebarSectionMap = Record<RouteGroup, SidebarItem[]>;

export type SidebarSection = {
  group: RouteGroup;
  items: SidebarItem[];
}

export interface SidebarItem {
  group: RouteGroup;
  routeFor: Role;
  label: string;
  path: string;
  icon: LucideIcon;
  order: number;
};


