import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { RouteGroup, RouteMetadata } from "@/lib/types";
import { useMatches } from "@tanstack/react-router";
import { Fragment, memo, useMemo } from "react";
import { SidebarTrigger } from "../ui/sidebar";
import { Skeleton } from "../ui/skeleton";

const StaticHeaderComponents = memo(() => {
  return (
    <>
      <SidebarTrigger className="-ml-1" />
      <Separator
        orientation="vertical"
        className="mr-2 data-[orientation=vertical]:h-4"
      />
    </>
  );
});

export const HumayBaseHeader = memo(() => {
  const matches = useMatches();

  const breadcrumbs = useMemo(
    () =>
      matches
        .map((match) => {
          const metadata = match.staticData?.metadata as RouteMetadata | undefined;
          if (!metadata?.title) return null;

          return {
            group: metadata.group,
            title: metadata.title,
            url: match.pathname,
          };
        })
        .filter(
          (item): item is { group: RouteGroup; title: string; url: string } =>
            item !== null
        ),
    [matches]
  );

  return (
    <header className="flex h-16 shrink-0 items-center gap-2">
      <div className="flex items-center gap-2 px-4">
        <StaticHeaderComponents />
        <Breadcrumb>
          <BreadcrumbList>
            {breadcrumbs.map((crumb, i) => {
              const isLast = i === breadcrumbs.length - 1;
              return (
                <Fragment key={i}>
                  {i === 0 && (
                    <BreadcrumbItem>
                      <BreadcrumbPage className="text-muted-foreground">
                        {crumb.group}
                      </BreadcrumbPage>
                    </BreadcrumbItem>
                  )}
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    {isLast ? (
                      <BreadcrumbPage>{crumb.title}</BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink href={crumb.url}>{crumb.title}</BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                  {!isLast && <BreadcrumbSeparator />}
                </Fragment>
              );
            })}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    </header>
  );
});

export const HeaderSkeleton = () => {
  return (
    <div className="flex h-16 shrink-0 items-center gap-2">
      <Skeleton className="h-full w-full" />
    </div>
  );
};
