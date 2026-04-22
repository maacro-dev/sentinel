import { TableHeader, Table, TableRow, TableHead, TableBody, TableCell } from "@/core/components/ui/table";
import { flexRender, Table as TanstackTable } from "@tanstack/react-table";
import { ScrollArea, ScrollAreaProvider, ScrollBar } from "@/core/components/ui/scroll-area";
import { getSizeClass } from "../tanstack/table/size";
import { cn } from "../utils/style";
import { ArrowDown, ArrowUp, Quote, X } from "lucide-react";
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from "./ui/empty";
import { ColumnHeader } from "./ColumnHeader";
import { Badge } from "./ui/badge";

export interface DataTableEvents<T> {
  onRowClick?: (row: T) => void
  onRowIntent?: (row: T) => void
}

export interface DataTableProps<T> extends DataTableEvents<T> {
  table: TanstackTable<T>,
  title?: React.ReactNode
  toolbar?: React.ReactNode
  secondaryToolbar?: React.ReactNode
  isLoading?: boolean
  pagination?: React.ReactNode
  getRowHeight?: (row: T) => number | string
}

export const DataTable = <T,>({
  table,
  title,
  toolbar,
  secondaryToolbar,
  pagination,
  onRowClick,
  onRowIntent,
  getRowHeight
}: DataTableProps<T>) => {

  const rows = table.getRowModel().rows

  return (
    <ScrollAreaProvider>
      <div className="flex-1 flex flex-col min-h-0 min-w-0 rounded-container border">
        {(title || toolbar) && (
          <div className="w-full flex justify-between items-center p-4 gap-2">
            {title && typeof title === 'string' ? <span className="text-2xl font-semibold">{title}</span> : title}
            {toolbar}
          </div>
        )}
        {secondaryToolbar}
        <ScrollArea className="h-full flex-1 min-h-0 whitespace-nowrap">
          <div className="absolute inset-0">
            <Table className={`min-w-full table-fixed ${rows.length == 0 ? 'h-full min-h-0 flex-1' : ''}`}>
              <TableHeader>
                {table.getHeaderGroups().map(headerGroup => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead
                        key={header.id}
                        className="min-w-0 relative whitespace-normal text-3xs font-normal pl-6 pr-0"
                        style={{
                          textAlign: header.column.columnDef.meta?.textAlign || 'left',
                          width: getSizeClass(header.column.columnDef.meta?.size)
                        }}
                      >
                        {header.isPlaceholder ? null : (
                          header.column.getCanSort() || header.column.getCanFilter()
                            ? (
                              <ColumnHeader
                                column={header.column}
                                title={
                                  typeof header.column.columnDef.header === "string"
                                    ? header.column.columnDef.header
                                    : String(header.column.id)
                                }
                              />
                            )
                            : (
                              <div className="truncate">
                                {flexRender(header.column.columnDef.header, header.getContext())}
                              </div>
                            )
                        )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {rows.length === 0 ? <EmptyTableRow colSpan={table.getHeaderGroups()[0].headers.length} /> :
                  rows.map((row) => {
                    const rowHeight = getRowHeight ? getRowHeight(row.original) : '5rem';

                    return (
                      <TableRow
                        key={row.id}
                        selected={row.getIsSelected()}
                        className={cn(`[&:last-child_td]:border-b z-10`, onRowClick && "cursor-pointer")}
                        style={{ height: rowHeight }}
                        onMouseEnter={() => onRowIntent?.(row.original)}
                        onClick={(e) => {
                          onRowClick?.(row.original);
                          row.getToggleSelectedHandler()(e)
                        }}
                      >
                        {row.getVisibleCells().map(cell => {
                          const cellWidth = getSizeClass(cell.column.columnDef.meta?.size)
                          return (
                            <TableCell
                              key={cell.id}
                              className="pl-6 pr-0 text-muted-foreground text-3xs"
                              align={cell.column.columnDef.meta?.textAlign || 'left'}
                              style={{ width: cellWidth, minWidth: cellWidth, height: rowHeight }}
                            >
                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </TableCell>
                          )
                        })}
                      </TableRow>
                    )
                  })
                }
              </TableBody>
            </Table>
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
        {pagination}
      </div>
    </ScrollAreaProvider>
  )
};

const EmptyTableRow = ({ colSpan }: { colSpan: number | undefined }) => {
  return (
    <TableRow className="p-0 hover:bg-transparent even:bg-red-50 border-b-transparent">
      <TableCell
        colSpan={colSpan}
        className="p-0 text-center text-xs text-muted-foreground"
      >
        <Empty className="p-0 md:p-0 from-30%">
          <EmptyHeader>
            <EmptyMedia variant="default">
              <Quote />
            </EmptyMedia>
            <EmptyTitle>No results found</EmptyTitle>
            <EmptyDescription className="text-xs text-muted-foreground/50">
              You&apos;re all caught up. New data will appear here.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      </TableCell>
    </TableRow>
  )
}


interface ActiveTableFiltersProps<T> {
  table: TanstackTable<T>;
  className?: string;
}

export function ActiveTableFilters<T>({ table, className }: ActiveTableFiltersProps<T>) {
  const sorting = table.getState().sorting;
  const columnFilters = table.getState().columnFilters;
  const hasActive = sorting.length > 0 || columnFilters.length > 0;

  return (
    <div className={cn(
      "flex flex-wrap items-center gap-x-3 gap-y-1.5 px-4 border-t min-h-9",
      hasActive ? "py-2" : "py-0",
      className
    )}>
      {hasActive ? (
        <>
          {sorting.length > 0 && (
            <div className="flex items-center gap-1.5">
              <span className="text-3xs text-muted-foreground/50 shrink-0">Sort</span>
              {sorting.map((sort) => {
                const column = table.getColumn(sort.id);
                const label = typeof column?.columnDef.header === "string"
                  ? column.columnDef.header
                  : sort.id;
                const Icon = sort.desc ? ArrowDown : ArrowUp;
                return (
                  <Badge
                    key={`sort-${sort.id}`}
                    variant="outline"
                    className="flex items-center gap-1 h-6 px-1.5 text-3xs font-normal text-muted-foreground cursor-default border-dashed"
                  >
                    <Icon className="size-2.5 shrink-0" />
                    {label}
                    <button
                      className="ml-0.5 hover:text-foreground transition-colors"
                      onClick={() => column?.clearSorting()}
                    >
                      <X className="size-2.5" />
                    </button>
                  </Badge>
                );
              })}
            </div>
          )}

          {sorting.length > 0 && columnFilters.length > 0 && (
            <div className="h-3.5 w-px bg-border shrink-0" />
          )}

          {columnFilters.length > 0 && (
            <div className="flex items-center gap-1.5">
              <span className="text-3xs text-muted-foreground/50 shrink-0">Filter</span>
              {columnFilters.map((filter) => {
                const column = table.getColumn(filter.id);
                const label = typeof column?.columnDef.header === "string"
                  ? column.columnDef.header
                  : filter.id;
                const filterOptions = column?.columnDef.meta?.filterOptions
                  ?? (column ? Array.from(column.getFacetedUniqueValues().keys()).map(v => ({ label: String(v), value: String(v) })) : []);

                const values = Array.isArray(filter.value) ? filter.value as string[] : [filter.value as string];
                const displayValues = values.map((v) => {
                  const match = filterOptions?.find((o) => o.value === v);
                  return match ? match.label : String(v);
                });

                return (
                  <Badge
                    key={`filter-${filter.id}`}
                    variant="secondary"
                    className="flex items-center gap-1 h-6 px-1.5 text-3xs font-normal text-muted-foreground cursor-default"
                  >
                    <span className="text-foreground/50">{label}:</span>
                    <span className="text-foreground/70">{displayValues.join(", ")}</span>
                    <button
                      className="ml-0.5 hover:text-foreground transition-colors"
                      onClick={() => column?.setFilterValue(undefined)}
                    >
                      <X className="size-2.5" />
                    </button>
                  </Badge>
                );
              })}
            </div>
          )}

          {(sorting.length + columnFilters.length) > 1 && (
            <button
              className="text-3xs text-muted-foreground/50 hover:text-foreground transition-colors ml-auto"
              onClick={() => { table.resetSorting(); table.resetColumnFilters(); }}
            >
              Clear all
            </button>
          )}
        </>
      ) : (
        <span className="text-3xs text-muted-foreground/30 select-none">No active filters</span>
      )}
    </div>
  );
}
