import { DataTable } from "@/core/components/DataTable"
import { TableSkeleton } from "@/core/components/TableSkeleton"
import { useFieldsTable } from "../../hooks/useFieldsTable"
import { DefaultTablePagination } from "@/core/components/TablePagination";
import { DefaultTableToolbar } from "@/core/components/TableToolbar";


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
        <DefaultTableToolbar
          defaultSearchPlaceholder="Search mfid or farmer"
          onSearchChange={e => table.setGlobalFilter(e.target.value)}
        />
      }
      pagination={<DefaultTablePagination table={table} />}
    />
  )
}
