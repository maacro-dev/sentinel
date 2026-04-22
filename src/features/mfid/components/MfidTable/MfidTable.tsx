import { DataTable, DataTableEvents } from "@/core/components/DataTable";
import { DefaultTablePagination } from "@/core/components/TablePagination";
import { TableSkeleton } from "@/core/components/TableSkeleton";
import { useMfidTable } from "../../hooks/useMfidTable";
import { useCallback, useState } from "react";
import { MfidFormDialog, MfidFormPayload } from "../MfidFormDialog";
import { useCreateMfid } from "../../hooks/useCreateMfid";
import { TableToolbar } from "@/core/components/DataTableToolbar";

export interface MfidTableProps<T> extends DataTableEvents<T> { }

export const MfidTable = <T extends { mfid: string }>({
  onRowClick
}: MfidTableProps<T>) => {
  "use no memo";

  const { table, isLoading } = useMfidTable();
  const [dialogOpen, setDialogOpen] = useState(false);
  const { createMfid, isLoading: isCreatingMfid } = useCreateMfid();

  const handleSubmit = useCallback(async (payload: MfidFormPayload) => {
    setDialogOpen(false);
    await createMfid(payload);
  }, [createMfid]);

  if (isLoading) {
    return <TableSkeleton />;
  }

  return (
    <DataTable
      table={table}
      toolbar={
        <TableToolbar
          table={table}
          actions={
            <MfidFormDialog
              open={dialogOpen}
              onOpenChange={setDialogOpen}
              onSubmit={handleSubmit}
              disabled={isCreatingMfid}
            />
          }
        />
      }
      onRowClick={onRowClick}
      pagination={<DefaultTablePagination table={table} />}
    />
  );
};
