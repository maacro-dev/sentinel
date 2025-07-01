import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { SidebarFooter, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { SidebarUserNavigationDropdown } from "@/components/base/sidebar";
import { useAuth } from "@/context/auth-context";
import { getRoleLabel } from "@/utils";
import { useNavigate } from "@tanstack/react-router";
import { ChevronsUpDown } from "lucide-react";
import { memo, useCallback } from "react";
import type { Role } from "@/lib/types";

export const SidebarUserNavigation = memo(() => {

  const navigate = useNavigate();
  const { user, handleSignOut } = useAuth();

  const handleSignOutClick = useCallback(async () => {
    try {
      await handleSignOut();
      await navigate({ to: "/login", replace: true, reloadDocument: true });
    } catch (error) {
      console.error("Failed to sign out:", error);
    }
  }, [handleSignOut, navigate]);

  return (
    <SidebarFooter>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarFallback className="rounded-lg">
                    {user?.first_name?.charAt(0)}
                    {user?.last_name?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{user?.first_name}</span>
                  <span className="truncate text-muted-foreground text-xs">
                    {getRoleLabel(user?.role as Role)}
                  </span>
                </div>
                <ChevronsUpDown className="ml-auto size-4" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <SidebarUserNavigationDropdown user={user} handleSignOutClick={handleSignOutClick} />
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarFooter>
  );
});
