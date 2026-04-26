import {
  ColumnDef,
  ColumnFiltersState,
  FilterFn,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  RowSelectionState,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";
import { endOfDay, isWithinInterval, parseISO, startOfDay } from "date-fns";
import { useState } from "react";

interface UseDataTableOptions<T> {
  data: T[];
  columns: ColumnDef<T, any>[];
  getRowId?: (row: T) => string;
  initialSorting?: SortingState;
  initialColumnFilters?: ColumnFiltersState;
  enableMultiSelect?: boolean;
}

export const useDataTable = <T>({
  data,
  columns,
  getRowId,
  initialSorting,
  initialColumnFilters,
  enableMultiSelect
}: UseDataTableOptions<T>) => {
  const [globalFilter, setGlobalFilter] = useState("");
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [sorting, setSorting] = useState<SortingState>(initialSorting ?? []);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(initialColumnFilters ?? []);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  const table = useReactTable({
    data,
    columns,
    enableRowSelection: true,
    enableMultiRowSelection: enableMultiSelect ?? false,
    enableSorting: true,
    enableColumnFilters: true,
    getRowId: getRowId || undefined,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    filterFns: {
      dateRange: dateRangeFilter
    },
    state: {
      globalFilter,
      pagination,
      rowSelection,
      sorting,
      columnFilters,
      columnVisibility,
    },
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    globalFilterFn: "includesString",
  });

  return table;
};


const dateRangeFilter: FilterFn<any> = (row, columnId, filterValue) => {
  const [from, to] = filterValue as [Date | null, Date | null];
  if (!from && !to) return true;

  const raw = row.getValue(columnId);
  const date = raw instanceof Date ? raw : parseISO(String(raw));
  if (isNaN(date.getTime())) return true;

  if (from && !to) return date >= startOfDay(from);
  if (!from && to) return date <= endOfDay(to);
  return isWithinInterval(date, { start: startOfDay(from!), end: endOfDay(to!) });
};
