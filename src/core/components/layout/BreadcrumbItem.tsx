import { BreadcrumbItem, BreadcrumbPage, BreadcrumbSeparator } from "@/core/components/ui/breadcrumb";
import { memo } from "react";

export type HeaderBreadcrumbItemProps = {
  section: string;
  title: string;
  url: string;
  isFirst?: boolean;
  isLast?: boolean;
};

export const HeaderBreadcrumbItem = memo(({ section,title }: HeaderBreadcrumbItemProps) => {
  return (
    <>
      <BreadcrumbItem>
        <BreadcrumbPage className="text-muted-foreground">
          {section}
        </BreadcrumbPage>
      </BreadcrumbItem>
      <BreadcrumbSeparator />
      <BreadcrumbItem>
        <BreadcrumbPage>{title}</BreadcrumbPage>
      </BreadcrumbItem>
    </>
  );
});
