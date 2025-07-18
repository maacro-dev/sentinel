import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { SidebarFooter, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { SidebarUserNavigationDropdown } from "./sidebar-user-dropdown";
import { useNavigate } from "@tanstack/react-router";
import { ChevronsUpDown } from "lucide-react";
import { memo, useCallback } from "react";
import type { Role } from "@/lib/types";
import { useAuthStore } from "@/store/auth-store";
import { showToast } from "@/app/toast";
import { ROLE_LABELS } from "@/app/config";

export const SidebarUserNavigation = memo(() => {

  const navigate = useNavigate();
  const handleSignOut = useAuthStore((state) => state.handleSignOut);
  const user = useAuthStore((state) => state.user);

  const handleSignOutClick = useCallback(async () => {

    const signOutResult = await handleSignOut();

    if (!signOutResult.ok) {
      showToast({
        type: "error",
        message: "Failed to sign out",
        description: signOutResult.error?.message,
      });

      return;
    }

    navigate({ to: "/login", replace: true });
    showToast({
      type: "success",
      message: "Success",
      description: "Successfully signed out",
    });

  }, [handleSignOut, navigate]);

  return (
    <SidebarFooter>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-green-200/5! data-[state=open]:text-sidebar-accent-foreground"
              >
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarFallback className="rounded-lg">
                    {user?.first_name?.charAt(0)}
                    {user?.last_name?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left leading-tight">
                  <span className="truncate text-xs font-medium">{user?.first_name}</span>
                  <span className="truncate text-muted-foreground/75 text-[0.7rem]">
                    {ROLE_LABELS[user?.role as Role]}
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
