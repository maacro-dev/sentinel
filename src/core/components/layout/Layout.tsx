import { ComponentProps } from "react";
import { SidebarInset, SidebarProvider } from "@/core/components/ui/sidebar";
import { LayoutSidebar } from "./Sidebar/Sidebar";
import { LayoutHeader } from "./Header";
import { Motion } from "../Motion";
import { useBreadcrumbs, useSidebarData } from "@/core/hooks";
import { DEFAULT_FADE_UP } from "@/core/utils/motions";
import type { Role } from "@/features/users";

interface LayoutProps extends ComponentProps<"div"> {
  role: Role;
};

export const Layout = ({ role, children, ...props }: LayoutProps) => {

  const breadcrumbs = useBreadcrumbs();
  const sidebarData = useSidebarData({ sidebarFor: role });

  return (
    <Motion motion={ DEFAULT_FADE_UP }>
      <SidebarProvider {...props}>
        <LayoutSidebar data={sidebarData}/>
        <SidebarInset className="size-full h-screen flex flex-col md:pl-0 !shadow-none">
          <LayoutHeader breadcrumbs={breadcrumbs}/>
          <div className="size-full min-h-0 flex-1 flex flex-col gap-4 p-4">
            {children}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </Motion>
  );
};
