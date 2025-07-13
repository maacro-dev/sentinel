import { memo } from "react";
import { BadgeCheck, LogOut } from "lucide-react";
import { DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Role, User } from "@/lib/types";
import { ROLE_LABELS } from "@/app/config";

export const SidebarUserNavigationDropdown = memo(
  ({
    user,
    handleSignOutClick,
  }: {
    user: User | null;
    handleSignOutClick: () => Promise<void>;
  }) => (
    <DropdownMenuContent
      className="w-(--radix-dropdown-menu-trigger-width) shadow-none min-w-56 rounded-lg font-mono"
      align="end"
      side="right"
      sideOffset={4}
    >
      <DropdownMenuLabel className="p-0 font-normal">
        <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
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
        </div>
      </DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuGroup>
        <DropdownMenuItem className="text-xs">
          <BadgeCheck />
          Account
        </DropdownMenuItem>
        {/* <DropdownMenuItem className="text-xs">
          <Bell />
          Notifications
        </DropdownMenuItem> */}
      </DropdownMenuGroup>
      {/* <DropdownMenuSeparator /> */}
      <DropdownMenuItem onClick={handleSignOutClick} className="text-xs">
        <LogOut />
        Log out
      </DropdownMenuItem>
    </DropdownMenuContent>
  )
);
