export type Role = "data_collector" | "data_manager" | "admin" | "*";
export type User = {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  role: Role;
};

export type RouteGroup = "Core" | "Forms";

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
