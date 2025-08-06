import { DataTable } from "@/core/components/DataTable"
import { TableSkeleton } from "@/core/components/TableSkeleton"
import { useFieldsTable } from "../../hooks/useFieldsTable"
import { FieldsTableToolbar } from "./FieldsTableToolbar"
import { TablePagination } from "@/core/components/TablePagination";

export function FieldsTable() {
  "use no memo"; // TODO: remove after RC is compatible with TanStack Table v8

  const { table, isLoading: areFieldsLoading } = useFieldsTable()

  if (areFieldsLoading) {
    return <TableSkeleton />
  }

  return (
    <DataTable
      table={table}
      toolbar={
        <FieldsTableToolbar
          onSearchChange={e => table.setGlobalFilter(e.target.value)}
        />
      }
      pagination={<TablePagination table={table} />}
    />
  )
}
