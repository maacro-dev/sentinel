import { HumayBaseSidebar } from "@/components/base/sidebar";
import { useSidebarData } from "@/hooks/use-sidebar-data";
import { memo } from "react";

const ManagerSidebar = memo(() => {
  const sidebarData = useSidebarData("data_manager");
  return <HumayBaseSidebar data={sidebarData} />;
});

export default ManagerSidebar;
