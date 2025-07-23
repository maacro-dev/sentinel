import * as React from "react"

import { cn } from "@/core/utils/style"
import { Skeleton } from "./skeleton"

function Table({ className, ...props }: React.ComponentProps<"table">) {
  return (
    <table
      data-slot="table"
      className={cn("w-full caption-bottom text-sm", className)}
      {...props}
    />
  )
}

function TableHeader({ className, ...props }: React.ComponentProps<"thead">) {
  return (
    <thead
      data-slot="table-header"
      className={cn("sticky top-0 bg-secondary", "[&_tr]:border-b", className)}
      {...props}
    />
  )
}

function TableBody({ className, ...props }: React.ComponentProps<"tbody">) {
  return (
    <tbody
      data-slot="table-body"
      className={
        cn(
          "[&_tr:last-child]:border-0",
          className
        )}
      {...props}
    />
  )
}

function TableFooter({ className, ...props }: React.ComponentProps<"tfoot">) {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn(
        "bg-muted/50 border-t font-medium [&>tr]:last:border-b-0",
        className
      )}
      {...props}
    />
  )
}

function TableRow({ className, children  }: React.ComponentProps<"tr">) {
  return (

    <tr
      data-slot="table-row"
      className={cn(
        "hover:bg-muted/25 data-[state=selected]:bg-muted border-b transition-colors",
        "p-2",
        "border-b border-b-muted-foreground/10",
        className
      )}
      children={children}
    />
  )
}

function TableRowSkeleton({ className, ...props }: React.ComponentProps<"tr">) {
  return (
    <TableRow className="border-b-0 hover:bg-transparent" {...props}>
      <TableCell colSpan={6} className="p-3 border-b-0">
        <Skeleton className={cn("h-24 w-full opacity-50", className)} />
      </TableCell>
    </TableRow>
  )
}

function TableHead({ className, ...props }: React.ComponentProps<"th">) {
  return (
    <th
      data-slot="table-head"
      className={cn(
        "text-foreground h-10 px-4 text-left align-middle font-medium whitespace-nowrap",
        "[&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:flex [&>[role=checkbox]]:items-center",
        "text-muted-foreground/75",
        className
      )}
      {...props}
    />
  )
}

function TableCell({ className, ...props }: React.ComponentProps<"td">) {
  return (
    <td
      data-slot="table-cell"
      className={cn(
        "p-4 align-middle [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:flex [&>[role=checkbox]]:items-center",
        className
      )}
      {...props}
    />
  )
}

function TableCaption({
  className,
  ...props
}: React.ComponentProps<"caption">) {
  return (
    <caption
      data-slot="table-caption"
      className={cn("text-muted-foreground mt-4 text-sm", className)}
      {...props}
    />
  )
}


export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableRowSkeleton,
  TableCell,
  TableCaption,
}
