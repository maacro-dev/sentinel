import { TableSkeleton } from "@/core/components/TableSkeleton";
import { DataTable } from "@/core/components/DataTable";
import { DefaultTablePagination } from "@/core/components/TablePagination";
import { FormType } from "@/routes/_manager/forms/-config";
import { useFormEntriesTable } from "../hooks/useFormDataTable";
import { useTableStore } from "../store";
import { TableToolbar } from "@/core/components/DataTableToolbar";
import type { DataTableEvents } from "@/core/components/DataTable";
import { FormDataEntry } from "../schemas/formData";

interface FormDataTableProps extends DataTableEvents<FormDataEntry> {
  formType: FormType;
  seasonId: number | undefined | null;
  showSeasonColumn?: boolean;
}

export const FormDataTable = ({
  formType,
  seasonId,
  onRowClick,
  onRowIntent,
  showSeasonColumn = false,
}: FormDataTableProps) => {
  "use no memo";

  const { table, isLoading } = useFormEntriesTable(formType, seasonId, showSeasonColumn);
  const setIds = useTableStore((s) => s.setIds);
  const setCurrentIndex = useTableStore((s) => s.setCurrentIndex);

  if (isLoading) return <TableSkeleton />;

  return (
    <DataTable
      table={table}
      toolbar={<TableToolbar table={table} />}
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
        if (index !== -1) setCurrentIndex(index);
        onRowClick?.(row);
      }}
      onRowIntent={onRowIntent}
    />
  );
};
