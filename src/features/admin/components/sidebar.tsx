import { HumayBaseSidebar } from "@/components/base/sidebar";
import { useSidebarData } from "@/hooks/use-sidebar-data";

const AdminSidebar = () => {
  const sidebarData = useSidebarData("admin");
  return <HumayBaseSidebar data={sidebarData} />;
};

export default AdminSidebar;
