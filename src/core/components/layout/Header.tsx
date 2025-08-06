import { ComponentProps, Fragment, memo } from "react";
import { Separator } from "@/core/components/ui/separator";
import { cn } from "@/core/utils/style";
import { UserMenu } from "../UserMenu";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "../ui/breadcrumb";
import { SidebarTrigger } from "../ui/sidebar";
import { CrumbDef } from "@/core/utils/breadcrumb";

interface LayoutHeaderProps extends ComponentProps<"header"> {
  breadcrumbs: Array<CrumbDef>;
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
        <Separator orientation="vertical" className="mx-2 data-[orientation=vertical]:h-4"/>
        <Breadcrumbs data={breadcrumbs} />
      </div>
      <UserMenu />
    </header>
  );
});


export const Breadcrumbs = memo(({ data }: { data: Array<CrumbDef> }) => {
  const isLast = (index: number, length: number) => index === length - 1;

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {data.map((crumb, index) => (
          <Fragment key={index}>
            <Crumb crumb={crumb} isLast={isLast(index, data.length)} />
            {index < data.length - 1 && <BreadcrumbSeparator />}
          </Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
});

export const Crumb = memo(({ crumb, isLast }: { crumb: CrumbDef, isLast: boolean }) => {
  const { label, isDynamic, navigatable } = crumb;
  const params = isDynamic ? crumb.params : undefined;
  const url = isDynamic ? crumb.url : undefined;

  return (
    <BreadcrumbItem>
      <BreadcrumbLink
        className={isLast ? "font-semibold text-foreground" : "text-muted-foreground"}
        to={url}
        params={params}
        enabled={isDynamic ? navigatable !== false : false}
      >
        {label}
      </BreadcrumbLink>
    </BreadcrumbItem>
  );
})
