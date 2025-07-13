import { memo } from "react";
import {
  Breadcrumb,
  BreadcrumbList,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { HeaderBreadcrumbItem } from "./header-breadcrumbs";
import { useBreadcrumbs } from "@/hooks";

export const BaseHeader = memo(() => {

  const breadcrumbs = useBreadcrumbs();

  return (
    <header className="sticky top-0 z-20 flex h-18 items-center gap-2 px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator
        orientation="vertical"
        className="mr-2 data-[orientation=vertical]:h-4"
      />
      <Breadcrumb>
        <BreadcrumbList>
          {breadcrumbs.map((crumb, idx) => (
            <HeaderBreadcrumbItem
              key={crumb.url + idx}
              section={crumb.section}
              title={crumb.title}
              url={crumb.url}
            />
          ))}
        </BreadcrumbList>
      </Breadcrumb>
    </header>
  );
});

