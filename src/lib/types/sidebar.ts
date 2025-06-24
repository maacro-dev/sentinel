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
