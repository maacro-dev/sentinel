import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Link } from "@tanstack/react-router";
import { memo, useMemo } from "react";
import { cn } from "@/lib/utils";
import { useSidebarData } from "@/hooks";
import HumayLogo from "@/components/logo";
import { Skeleton } from "@/components/ui/skeleton";
import { SidebarUserNavigation } from "@/components/base/sidebar";

import type { Role, SidebarData } from "@/lib/types";

export interface BaseSidebarProps {
  role: Role;
}

export const BaseSidebar = memo(({ role, ...props }: BaseSidebarProps) => {
  const data = useSidebarData(role);
  return <HumayBaseSidebar data={data} {...props} />;
});

type HumayBaseSidebarProps = {
  data: SidebarData;
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
          <SidebarGroup key={group.group}>
            <SidebarGroupLabel>{group.group}</SidebarGroupLabel>
            <SidebarMenu>
              {group.items.map((item) => (
                <SidebarMenuItem key={item.label}>
                  <SidebarMenuButton asChild>
                    <Link
                      to={item.path}
                      className="flex items-center gap-2.5"
                      activeProps={{ className: "bg-sidebar-accent" }}
                    >
                      <item.icon className="!size-4" />
                      <span className="text-xs">{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarUserNavigation />
    </Sidebar>
  );
});


export const SidebarSkeleton = ({ className }: { className?: string }) => {
  return (
    <div className="h-screen w-(--sidebar-width)">
      <Skeleton className={cn("h-full w-full", className)} />
    </div>
  );
};