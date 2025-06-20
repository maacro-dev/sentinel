import { HumayBaseSidebar } from "@/components/base/sidebar";
import { useSidebarData } from "@/hooks/use-sidebar-data";
import { memo } from "react";

const Sidebar = () => {
  const sidebarData = useSidebarData("admin");
  return <HumayBaseSidebar data={sidebarData} />;
};

const AdminSidebar = memo(Sidebar);

export default AdminSidebar;
