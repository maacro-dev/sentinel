import type { LucideIcon } from "lucide-react";
import { Role } from "@/features/users";
import { RouteGroup } from "@/core/tanstack/router/types";

export interface SidebarStaticData {
  group: RouteGroup;
  navItemOrder: number;
  label: string;
  icon: LucideIcon;
  routeFor: Role;
  disabled: boolean;
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
  disabled: boolean;
};
