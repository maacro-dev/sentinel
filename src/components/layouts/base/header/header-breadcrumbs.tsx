import { BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { memo } from "react";
import { Fragment } from "react/jsx-runtime";

export type HeaderBreadcrumbItemProps = {
  section: string;
  title: string;
  url: string;
  isFirst?: boolean;
  isLast?: boolean;
};

export const HeaderBreadcrumbItem = memo(
  ({
    section,
    title,
    url,
    isFirst = false,
    isLast = false,
  }: HeaderBreadcrumbItemProps) => {
    if (isFirst && isLast) {
      return (
        <BreadcrumbItem>
          <BreadcrumbPage>{title}</BreadcrumbPage>
        </BreadcrumbItem>
      );
    }

    return (
      <Fragment>
        {!isFirst && <BreadcrumbSeparator />}

        {isFirst ? (
          <BreadcrumbItem>
            <BreadcrumbPage className="text-muted-foreground">
              {section}
            </BreadcrumbPage>
          </BreadcrumbItem>
        ) : (
          <BreadcrumbItem>
            {isLast ? (
              <BreadcrumbPage>{title}</BreadcrumbPage>
            ) : (
              <BreadcrumbLink href={url}>{title}</BreadcrumbLink>
            )}
          </BreadcrumbItem>
        )}

        {!isLast && <BreadcrumbSeparator />}
      </Fragment>
    );
  }
);
