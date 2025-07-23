import { DataTable } from "@/core/components/DataTable"
import { TableSkeleton } from "@/core/components/TableSkeleton"
import { useFieldsTable } from "../../hooks/useFieldsTable"
import { FieldsTableToolbar } from "./FieldsTableToolbar"

export function FieldsTable() {
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
    />
  )
}
