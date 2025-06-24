import type { Role } from ".";
import type { SidebarRouteOptions } from ".";

export type RouteGroup =
  | "Core"
  | "Forms"
  | "Overview"
  | "Access Control"
  | "Operations"
  | "Configuration";

export type RouteMetadata = {
  group: RouteGroup;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  sidebarOptions?: SidebarRouteOptions;
  for: Role;
};
