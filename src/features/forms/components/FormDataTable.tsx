import { TableSkeleton } from "@/core/components/TableSkeleton";
import { DataTable, DataTableEvents } from "@/core/components/DataTable";
import { DefaultTablePagination } from "@/core/components/TablePagination";
import { useFormDataTable } from "../hooks/useFormDataTable";
import { FormRouteType } from "@/routes/_manager/forms/-config";
import { DefaultTableToolbar } from "@/core/components/TableToolbar";
import { useCallback } from "react";

interface FormDataTableProps<T> extends DataTableEvents<T> {
  formType: FormRouteType
}

export const FormDataTable = <T extends { mfid: string }>({
  formType,
  onRowClick,
  onRowIntent,
}: FormDataTableProps<T>) => {
  "use no memo"; // TODO: remove after RC is compatible with TanStack Table v8

  const { table, isLoading: isLoadingFieldData } = useFormDataTable(formType);
  const handleRowClick = useCallback((row: T) => {
    onRowClick?.(row)
  }, [])

  const handleRowIntent = useCallback((row: T) => {
    onRowIntent?.(row)
  }, [])

  if (isLoadingFieldData) {
    return <TableSkeleton />;
  }

  return (
    <>
      <DataTable
        table={table}
        toolbar={
          <DefaultTableToolbar
            onSearchChange={e => table.setGlobalFilter(e.target.value)}
            defaultSearchPlaceholder="Search anything..."
          />
        }
        pagination={<DefaultTablePagination table={table} />}
        onRowClick={handleRowClick}
        onRowIntent={handleRowIntent}
      />
    </>
  )
}
