import { ComponentProps, Fragment, memo, useState } from "react";
import { Separator } from "@/core/components/ui/separator";
import { cn } from "@/core/utils/style";
import { UserMenu } from "../UserMenu";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "../ui/breadcrumb";
import { SidebarTrigger } from "../ui/sidebar";
import { CrumbDef } from "@/core/utils/breadcrumb";
import { SeasonSelector } from "@/features/analytics/components/SeasonSelector";
import { Role } from "@/features/users";
import { Button } from "../ui/button";
import { Download } from "lucide-react";
import { useSearch } from "@tanstack/react-router";
import { useSessionStore } from "@/features/authentication/store";
import { generateFullReport } from "@/features/reports/report";
import { Spinner } from "../ui/spinner";
import { useQueryClient } from "@tanstack/react-query";
import { NotificationsDropdown } from "@/features/notifications/components/NotificationsDropdown";
import { getSupabase } from "@/core/supabase";

interface LayoutHeaderProps extends ComponentProps<"header"> {
  breadcrumbs: Array<CrumbDef>;
  role: Role;
}

export const LayoutHeader = memo(({ breadcrumbs, className, role, ...props }: LayoutHeaderProps) => {

  const { seasonId } = useSearch({ strict: false }) as { seasonId?: number };
  const user = useSessionStore((state) => state.user);
  const [exporting, setExporting] = useState(false);
  const queryClient = useQueryClient();

  const handleExport = async () => {
    if (!seasonId) {
      alert('No season selected');
      return;
    }
    setExporting(true);
    try {
      const supabase = await getSupabase();
      await generateFullReport(seasonId, queryClient, supabase, user?.email || 'Unknown');
    } catch (err) {
      console.error('Export failed', err);
    } finally {
      setExporting(false);
    }
  };

  const headerClasses = cn("h-16 sticky top-0 z-20 flex w-full shrink-0 items-center justify-between gap-2 px-4 py-4", "border-b border-border bg-white", className)

  return (
    <header className={headerClasses} {...props} >
      <div className="flex items-center">
        <SidebarTrigger className="text-muted-foreground" />
        <Separator orientation="vertical" className="mx-2 data-[orientation=vertical]:h-4" />
        <Breadcrumbs data={breadcrumbs} />
      </div>
      <div className="flex gap-4">
        {role === 'data_manager' && (
          <>
            <SeasonSelector />
            <div>
              <Button variant="ghost" onClick={handleExport} disabled={exporting}>
                {exporting ? <Spinner className="size-4" /> : <Download className="size-4" />}
              </Button>
              <NotificationsDropdown />
            </div>
          </>
        )}
        <UserMenu />
      </div>
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
  const { label, navigatable } = crumb;
  // const params = isDynamic ? crumb.params : undefined;
  const url = crumb.url;
  const enabled = !isLast && (navigatable !== false);

  return (
    <BreadcrumbItem>
      <BreadcrumbLink
        className={isLast ? "font-medium text-foreground" : "text-muted-foreground"}
        to={url} enabled={enabled}
      >
        {label}
      </BreadcrumbLink>
    </BreadcrumbItem>
  );
})
