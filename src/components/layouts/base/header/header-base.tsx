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
    <header className="flex h-16 items-center gap-2 px-4">
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
              isFirst={idx === 0}
              isLast={idx === breadcrumbs.length - 1}
            />
          ))}
        </BreadcrumbList>
      </Breadcrumb>
    </header>
  );
});

