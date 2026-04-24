import { TableHeader, Table, TableRow, TableHead, TableBody, TableCell } from "@/core/components/ui/table";
import { flexRender, Table as TanstackTable } from "@tanstack/react-table";
import { ScrollArea, ScrollAreaProvider, ScrollBar } from "@/core/components/ui/scroll-area";
import { getSizeClass } from "../tanstack/table/size";
import { cn } from "../utils/style";
import { ArrowDown, ArrowUp, Quote, X } from "lucide-react";
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from "./ui/empty";
import { ColumnHeader } from "./ColumnHeader";
import { Badge } from "./ui/badge";
import { Checkbox } from "./ui/checkbox";

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
  selectable?: boolean
}

// const SELECT_COLUMN_ID = '__select__';

export const DataTable = <T,>({
  table,
  title,
  toolbar,
  secondaryToolbar,
  pagination,
  onRowClick,
  onRowIntent,
  getRowHeight,
  selectable = false,
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
                    {selectable && (
                      <TableHead
                        className="min-w-0 relative pl-6 pr-0 cursor-pointer"
                        style={{ width: '2.5%' }}
                      >
                        <div onClick={(e) => e.stopPropagation()}>
                          <Checkbox
                            checked={table.getIsAllPageRowsSelected() ? true : table.getIsSomePageRowsSelected() ? "indeterminate" : false}
                            onCheckedChange={(v) => table.toggleAllPageRowsSelected(!!v)}
                          />
                        </div>
                      </TableHead>
                    )}
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
                {rows.length === 0
                  ? <EmptyTableRow colSpan={(selectable ? 1 : 0) + (table.getHeaderGroups()[0]?.headers.length ?? 0)} />
                  : rows.map((row) => {
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
                          row.getToggleSelectedHandler()(e);
                        }}
                      >
                        {selectable && (
                          <TableCell
                            className="pl-6 pr-0"
                            style={{ width: '2.5%', minWidth: '2.5%', height: rowHeight }}
                            onClick={(e) => {
                              e.stopPropagation();
                              row.toggleSelected();
                            }}
                          >
                            <Checkbox
                              checked={row.getIsSelected()}
                              onClick={(e) => e.stopPropagation()}
                              onCheckedChange={(v) => row.toggleSelected(!!v)}
                              className="cursor-pointer pointer-events-none"
                            />
                          </TableCell>
                        )}
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

const EmptyTableRow = ({ colSpan }: { colSpan: number }) => {
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

// ─── ActiveTableFilters ───────────────────────────────────────────────────────

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

                const rawValue = filter.value;
                const displayValues = rawValue === true ? ['Yes']
                  : rawValue === false ? ['No']
                    : (Array.isArray(rawValue) ? rawValue as string[] : [String(rawValue)])
                      .map((v) => filterOptions.find((o) => o.value === v)?.label ?? v);

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
