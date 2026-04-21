import { TableSkeleton } from "@/core/components/TableSkeleton";
import { DataTable, DataTableEvents } from "@/core/components/DataTable";
import { DefaultTablePagination } from "@/core/components/TablePagination";
import { FormType } from "@/routes/_manager/forms/-config";
import { DefaultTableToolbar } from "@/core/components/TableToolbar";
import { useFormEntriesTable } from "../hooks/useFormDataTable";
import { useTableStore } from "../store";

interface FormDataTableProps<T> extends DataTableEvents<T> {
  formType: FormType;
  seasonId?: number;
}

export const FormDataTable = <T extends { activity: { id: number } }>({
  formType,
  seasonId,
  onRowClick,
  onRowIntent,
}: FormDataTableProps<T>) => {
  const { table, isLoading } = useFormEntriesTable(formType, seasonId);
  const setIds = useTableStore((s) => s.setIds);
  const setCurrentIndex = useTableStore((s) => s.setCurrentIndex);

  if (isLoading) return <TableSkeleton />;

  return (
    <DataTable
      table={table}
      toolbar={
        <DefaultTableToolbar
          onSearchChange={(e) => table.setGlobalFilter(e.target.value)}
          defaultSearchPlaceholder="Search anything..."
          onClearAll={() => table.resetColumnFilters()}
        />
      }
      pagination={<DefaultTablePagination table={table} />}
      onRowClick={(row) => {
        const id = row.activity.id;
        if (id === undefined || isNaN(id)) {
          console.error("Invalid ID in row click:", row);
          return;
        }
        const rows = table.getCoreRowModel().rows;
        const ids = rows.map((r) => r.id);
        const index = rows.findIndex((r) => r.id === String(id));
        setIds(ids);
        if (index !== -1) {
          setCurrentIndex(index);
        }
        onRowClick?.(row);
      }}
      onRowIntent={onRowIntent}
    />
  );
};
