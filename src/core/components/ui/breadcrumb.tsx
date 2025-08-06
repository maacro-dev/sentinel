import * as React from "react";
import { ChevronRight } from "lucide-react";

import { cn } from "@/core/utils/style";
import { Link, LinkProps } from "@tanstack/react-router";

export function Breadcrumb({ ...props }: React.ComponentProps<"nav">) {
  return <nav aria-label="breadcrumb" data-slot="breadcrumb" {...props} />;
}

export function BreadcrumbList({ className, ...props }: React.ComponentProps<"ol">) {
  return (
    <ol
      data-slot="breadcrumb-list"
      className={cn(
        "text-muted-foreground flex flex-wrap items-center gap-1.5 text-sm break-words sm:gap-2.5",
        className
      )}
      {...props}
    />
  );
}

export function BreadcrumbItem({ className, ...props }: React.ComponentProps<"li">) {
  return (
    <li
      data-slot="breadcrumb-item"
      className={cn("inline-flex items-center gap-1.5", className)}
      {...props}
    />
  );
}

type BreadcrumbLinkProps = LinkProps & React.ComponentProps<"a"> & {
  className: string;
  enabled?: boolean;
};

export function BreadcrumbLink({
  className,
  enabled = true,
  to,
  ...props
}: BreadcrumbLinkProps) {
  const Component = enabled && to !== undefined ? Link : "span";
  const styles = cn(
    enabled
      ? "text-foreground hover:text-foreground transition-colors"
      : "text-muted-foreground font-normal",
    className
  );

  return (
    <Component
      data-slot="breadcrumb-link"
      className={styles}
      {...(enabled && to ? { to } : {})}
      {...props}
    />
  )
}

export function BreadcrumbSeparator({
  children,
  className,

  ...props
}: React.ComponentProps<"li">) {
  return (
    <li
      data-slot="breadcrumb-separator"
      role="presentation"
      aria-hidden="true"
      className={cn("[&>svg]:size-3.5 opacity-30", className)}
      {...props}
    >
      {children ?? <ChevronRight />}
    </li>
  );
}
