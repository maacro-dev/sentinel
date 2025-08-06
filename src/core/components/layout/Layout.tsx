import { ComponentProps } from "react";
import { SidebarInset, SidebarProvider } from "@/core/components/ui/sidebar";
import { LayoutSidebar } from "./Sidebar/Sidebar";
import { LayoutHeader } from "./Header";
import { Motion } from "../Motion";
import { DEFAULT_FADE_UP } from "@/core/utils/motions";
import type { Role } from "@/features/users";
import { useBreadcrumbs } from "@/core/hooks/useBreadcrumbs";
import { useSidebarData } from "@/core/hooks";

interface LayoutProps extends ComponentProps<"div"> {
  role: Role;
};

export const Layout = ({ role, children, ...props }: LayoutProps) => {

  const breadcrumbs = useBreadcrumbs();
  const sidebarData = useSidebarData({ role });

  return (
    <Motion motion={ DEFAULT_FADE_UP }>
      <SidebarProvider {...props}>
        <LayoutSidebar data={sidebarData}/>
        <SidebarInset className="size-full h-screen min-w-0 flex flex-col md:pl-0 !shadow-none">
          <LayoutHeader breadcrumbs={breadcrumbs} />
          <div className="size-full min-h-0 min-w-0 flex-1 flex gap-4">
            {children}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </Motion>
  );
};
