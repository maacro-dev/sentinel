import { HumayBaseSidebar } from "@/components/base/sidebar";
import { useSidebarData } from "@/hooks/use-sidebar-data";
import { memo } from "react";

const Sidebar = () => {
  const sidebarData = useSidebarData("data_manager");
  return <HumayBaseSidebar data={sidebarData} />;
};

const ManagerSidebar = memo(Sidebar);

export default ManagerSidebar;
