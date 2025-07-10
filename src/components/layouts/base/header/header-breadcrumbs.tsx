import { BreadcrumbItem, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { memo } from "react";
import { Fragment } from "react/jsx-runtime";

export type HeaderBreadcrumbItemProps = {
  section: string;
  title: string;
  url: string;
  isFirst?: boolean;
  isLast?: boolean;
};

export const HeaderBreadcrumbItem = memo(({ section,title }: HeaderBreadcrumbItemProps) => {
  return (
    <Fragment>
      <BreadcrumbItem>
        <BreadcrumbPage className="text-muted-foreground">
          {section}
        </BreadcrumbPage>
      </BreadcrumbItem>
      <BreadcrumbSeparator />
      <BreadcrumbItem>
        <BreadcrumbPage>{title}</BreadcrumbPage>
      </BreadcrumbItem>
    </Fragment>
  );
});
