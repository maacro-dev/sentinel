import {
  ColumnDef,
  FilterFnOption,
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable
} from "@tanstack/react-table";
import { useState } from "react";

export const useDataTable = <T>(
  data: T[],
  columns: ColumnDef<T, any>[],
  options?: {
    globalFilterFn?: FilterFnOption<T>
  }
) => {
  const [globalFilter, setGlobalFilter] = useState('')

  const table = useReactTable({
    data: data,
    columns: columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: options?.globalFilterFn ?? 'includesString',
  })

  return { table }
}
