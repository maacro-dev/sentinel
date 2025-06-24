import { BadgeCheck, Bell, ChevronsUpDown, LogOut } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Link, useNavigate } from "@tanstack/react-router";
import { memo, useCallback } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuGroup,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { cn, mapRole } from "@/lib/utils";
import { useAuth } from "@/context/auth-context";
import HumayLogo from "../logo";
import { Skeleton } from "../ui/skeleton";

import type { SidebarDataGroup, User } from "@/lib/types";

type HumayBaseSidebarProps = {
  data: SidebarDataGroup[];
} & React.ComponentProps<typeof Sidebar>;

export const HumayBaseSidebar = memo(({ data, ...props }: HumayBaseSidebarProps) => {
  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <HumayLogo />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {data.map((group) => (
          <SidebarGroup key={group.title}>
            <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
            <SidebarMenu>
              {group.items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link
                      to={item.url}
                      className="flex items-center gap-2.5"
                      activeProps={{ className: "bg-sidebar-accent" }}
                    >
                      <item.icon className="!size-4" />
                      <span className="text-xs">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <HumaySidebarFooter />
    </Sidebar>
  );
});

const HumaySidebarFooter = memo(() => {
  const navigate = useNavigate();
  const { user, handleLogout } = useAuth();

  const handleLogoutClick = useCallback(async () => {
    try {
      await handleLogout();
      await navigate({ to: "/login", replace: true });
    } catch (error) {
      console.error("Failed to sign out:", error);
    }
  }, [handleLogout, navigate]);

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
                  <AvatarImage
                    src="https://avatar.iran.liara.run/public/40"
                    alt={user?.first_name}
                  />
                  <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{user?.first_name}</span>
                  <span className="truncate text-muted-foreground text-xs">
                    {mapRole(user?.role)}
                  </span>
                </div>
                <ChevronsUpDown className="ml-auto size-4" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <StaticDropdownContent user={user} handleLogoutClick={handleLogoutClick} />
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarFooter>
  );
});

const StaticDropdownContent = memo(
  ({
    user,
    handleLogoutClick,
  }: {
    user: User | null;
    handleLogoutClick: () => Promise<void>;
  }) => (
    <DropdownMenuContent
      className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
      align="end"
      side="right"
      sideOffset={4}
    >
      <DropdownMenuLabel className="p-0 font-normal">
        <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
          <Avatar className="h-8 w-8 rounded-lg">
            <AvatarImage
              src="https://avatar.iran.liara.run/public/40"
              alt={user?.first_name}
            />
            <AvatarFallback className="rounded-lg">CN</AvatarFallback>
          </Avatar>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-medium">{user?.first_name}</span>
            <span className="truncate text-xs">{user?.username}</span>
          </div>
        </div>
      </DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuGroup>
        <DropdownMenuItem>
          <BadgeCheck />
          Account
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Bell />
          Notifications
        </DropdownMenuItem>
      </DropdownMenuGroup>
      <DropdownMenuSeparator />
      <DropdownMenuItem onClick={handleLogoutClick}>
        <LogOut />
        Log out
      </DropdownMenuItem>
    </DropdownMenuContent>
  )
);

export const SidebarSkeleton = ({ className }: { className?: string }) => {
  return (
    <div className="h-screen w-(--sidebar-width)">
      <Skeleton className={cn("h-full w-full", className)} />
    </div>
  );
};
