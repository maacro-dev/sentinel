import { memo } from "react";
import { HumayLogo } from "@/core/components/HumayLogo";
import { SidebarLink } from "./SidebarItem";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton
} from "@/core/components/ui/sidebar";
import { SidebarData } from "./types";

interface LayoutSidebarProps extends React.ComponentProps<typeof Sidebar> {
  data: SidebarData;
}

export const LayoutSidebar = memo(({ data, ...props }: LayoutSidebarProps) => {

  return (
    <Sidebar variant="inset" collapsible="icon" {...props}>
      <SidebarHeader className="border-b !h-16 py-2 px-4 flex justify-center items-start ">
        {/* <SidebarMenuItem className="list-none"> */}
          <SidebarMenuButton size="lg" className="hover:bg-transparent active:bg-transparent ">
            <HumayLogo size={8} />
          </SidebarMenuButton>
        {/* </SidebarMenuItem> */}
      </SidebarHeader>
      <SidebarContent>
        {data.map((section) => (
          <SidebarGroup key={section.group}>
            <SidebarGroupLabel>{section.group}</SidebarGroupLabel>
            <SidebarMenu>
              {section.items.map((item) => (
                  <SidebarLink key={item.label} {...item} />
              ))}
            </SidebarMenu>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  );
});
