import type { Role } from "@/features/users";
import { managerSidebarConfig } from "@/routes/_manager/-config";
import { adminSidebarConfig } from "@/routes/admin/-config";

export function useSidebarData({ role }: { role: Role }) {
  switch(role) {
    case "data_manager":
      return managerSidebarConfig;
    case "admin":
      return adminSidebarConfig;
    default:
      throw new Error(`Unsupported role: ${role}`);
  }
}
