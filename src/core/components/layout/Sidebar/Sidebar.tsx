import { memo } from "react";
import { HumayLogo } from "@/core/components/HumayLogo";
import { SidebarItem } from "./SidebarItem";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarProps
} from "@/core/components/ui/sidebar";
import { SidebarNode } from "./types";

interface LayoutSidebarProps extends SidebarProps {
  data: Array<SidebarNode>;
}

export const LayoutSidebar = memo(({ data, ...props }: LayoutSidebarProps) => {
  return (
    <Sidebar variant="inset" collapsible="icon" {...props}>
      <SidebarHeader className="border-b !h-16 py-2 px-4 flex justify-center items-start ">
        <SidebarMenuButton size="lg" className="hover:bg-transparent active:bg-transparent ">
          <HumayLogo size={8} />
        </SidebarMenuButton>
      </SidebarHeader>
      <SidebarContent>
        {data.map((group) => (
           <SidebarGroup key={group.id}>
             <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
             <SidebarMenu>
               {group.children?.map((node: SidebarNode) => (
                 <SidebarItem key={node.id} node={node} />
               ))}
             </SidebarMenu>
           </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  );
});
