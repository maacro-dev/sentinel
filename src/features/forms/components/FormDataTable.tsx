import { TableSkeleton } from "@/core/components/TableSkeleton";
import { DataTable, DataTableEvents } from "@/core/components/DataTable";
import { DefaultTablePagination } from "@/core/components/TablePagination";
import { FormRouteType } from "@/routes/_manager/forms/-config";
import { DefaultTableToolbar } from "@/core/components/TableToolbar";
import { useFormEntriesTable } from "../hooks/useFormDataTable";
import { useTableStore } from "../store";

interface FormDataTableProps<T> extends DataTableEvents<T> {
  formType: FormRouteType
}

export const FormDataTable = <T extends { field: { mfid: string } }>({
  formType,
  onRowClick,
  onRowIntent,
}: FormDataTableProps<T>) => {
  "use no memo"; // TODO: remove after RC is compatible with TanStack Table v8

  const { table, isLoading: isLoadingFieldData } = useFormEntriesTable(formType);
  const setIds = useTableStore((state) => state.setIds);
  const setCurrentIndex = useTableStore((state) => state.setCurrentIndex);

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
        onRowClick={(row) => {
          const rows = table.getCoreRowModel().rows
          const ids = rows.map((row) => row.id);
          const index = rows.filter(r => r.id === row.field.mfid)[0].index;

          setIds(ids);
          setCurrentIndex(index);
          onRowClick?.(row);
        }}
        onRowIntent={onRowIntent}
      />
    </>
  )
}
