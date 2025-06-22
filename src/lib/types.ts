import { Role } from "./schemas/user";

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

export type SidebarRouteOptions = {
  showInSidebar?: boolean;
  order?: number;
};

export type SidebarDataItem = {
  title: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
};

export type SidebarDataGroup = {
  title: string;
  items: SidebarDataItem[];
};

export type Result<T> = {
  data: T | null;
  error: Error | null;
};
