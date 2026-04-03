import { TableSkeleton } from "@/core/components/TableSkeleton";
import { DataTable, DataTableEvents } from "@/core/components/DataTable";
import { DefaultTablePagination } from "@/core/components/TablePagination";
import { FormType } from "@/routes/_manager/forms/-config";
import { DefaultTableToolbar } from "@/core/components/TableToolbar";
import { useFormEntriesTable } from "../hooks/useFormDataTable";
import { useTableStore } from "../store";
import { useState } from "react";
import { Button } from "@/core/components/ui/button";
import { cn } from "@/core/utils/style";

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
  const [hideRejected, setHideRejected] = useState(false);
  const { table, isLoading: isLoadingFieldData } = useFormEntriesTable(formType, seasonId, hideRejected);
  const setIds = useTableStore((state) => state.setIds);
  const setCurrentIndex = useTableStore((state) => state.setCurrentIndex);

  if (isLoadingFieldData) {
    return <TableSkeleton />;
  }

  return (
    <DataTable
      table={table}
      toolbar={
        <DefaultTableToolbar
          onSearchChange={e => table.setGlobalFilter(e.target.value)}
          defaultSearchPlaceholder="Search anything..."
          className="gap-4"
          actions={
            <Button
              className={cn(
                "w-28 text-xs h-full",
                hideRejected ? "text-white" : "text-muted-foreground"
              )}
              variant={hideRejected ? "default" : "outline"}
              size="sm"
              onClick={() => setHideRejected(!hideRejected)}
            >
              {hideRejected ? "Show Rejected" : "Hide Rejected"}
            </Button>
          }
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
