import {
  ColumnDef,
  ColumnFiltersState,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  RowSelectionState,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";
import { useState } from "react";

interface UseDataTableOptions<T> {
  data: T[];
  columns: ColumnDef<T, any>[];
  getRowId?: (row: T) => string;
  initialSorting?: SortingState;
}

export const useDataTable = <T>({
  data,
  columns,
  getRowId,
  initialSorting
}: UseDataTableOptions<T>) => {
  const [globalFilter, setGlobalFilter] = useState("");
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [sorting, setSorting] = useState<SortingState>(initialSorting ?? []);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  const table = useReactTable({
    data,
    columns,
    enableRowSelection: true,
    enableMultiRowSelection: false,
    enableSorting: true,
    enableColumnFilters: true,
    getRowId: getRowId || undefined,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    // "arrIncludesSome" is a built-in TanStack filter:
    // it passes if the cell value is included in the filter array.
    // Columns without filterOptions fall back to "includesString".
    filterFns: {},
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
