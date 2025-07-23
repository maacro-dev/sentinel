import { ComponentProps, memo } from "react";
import {
  Breadcrumb,
  BreadcrumbList,
} from "@/core/components/ui/breadcrumb";
import { Separator } from "@/core/components/ui/separator";
import { SidebarTrigger } from "@/core/components/ui/sidebar";
import { HeaderBreadcrumbItem } from "./BreadcrumbItem";
import { cn } from "@/core/utils/style";
import { RouteBreadcrumb } from "@/core/tanstack/router/types";
import { UserMenu } from "../UserMenu";

interface LayoutHeaderProps extends ComponentProps<"header"> {
  breadcrumbs: RouteBreadcrumb[];
}

export const LayoutHeader = memo(({
  breadcrumbs,
  className,
  ...props
}: LayoutHeaderProps) => {
  return (
    <header
      className={cn(
        "h-16 sticky top-0 z-20 flex w-full shrink-0 items-center justify-between gap-2 px-4 py-4",
        "border-b border-border bg-white",
        className
      )}
      {...props}
    >
      <div className="flex items-center">
        <SidebarTrigger className="text-muted-foreground" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <Breadcrumb>
          <BreadcrumbList className="flex-nowrap">
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
      </div>
      <UserMenu />
    </header>
  );
});
