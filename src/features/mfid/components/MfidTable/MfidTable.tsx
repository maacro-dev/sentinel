import { DataTable, DataTableEvents } from "@/core/components/DataTable";
import { DefaultTablePagination } from "@/core/components/TablePagination";
import { TableSkeleton } from "@/core/components/TableSkeleton";
import { useMfidTable } from "../../hooks/useMfidTable";
import { useCallback, useMemo, useState } from "react";
import { MfidFormDialog, MfidFormPayload } from "../MfidFormDialog";
import { useCreateMfid } from "../../hooks/useCreateMfid";
import { TableToolbar } from "@/core/components/DataTableToolbar";
import { BatchScheduleDialog, BatchScheduleInput } from "@/features/collection/components/BatchScheduleDialog";
import { useBatchScheduleFieldData } from "@/features/collection/components/MfidCollectionTasks";

export interface MfidTableProps<T> extends DataTableEvents<T> {
  seasonId: number;
}

export const MfidTable = <T extends { mfid: string }>({
  onRowClick,
  seasonId
}: MfidTableProps<T>) => {
  "use no memo";

  const { table, isLoading } = useMfidTable(seasonId);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { createMfid, isLoading: isCreatingMfid } = useCreateMfid();

  const [batchDialogOpen, setBatchDialogOpen] = useState(false);
  const { mutate: batchSchedule, isPending: isBatchScheduling } = useBatchScheduleFieldData();

  const selectedRows = table.getSelectedRowModel().rows;

  const selectedMfids = selectedRows.map(row => row.original.mfid);

  const scheduledSelectedMfids = useMemo(
    () =>
      selectedRows
        .filter(row => (row.original as any).has_scheduling)
        .map(row => (row.original as any).mfid),
    [selectedRows]
  );

  // const unscheduledCount = selectedMfids.length - scheduledSelectedMfids.length;

  const handleBatchSubmit = (input: BatchScheduleInput) => {
    batchSchedule(
      {
        mfids: selectedMfids,
        seasonId,
        collectorId: input.collector_id,
        startDate: input.start_date,
        endDate: input.end_date,
      },
      {
        onSuccess: () => {
          setBatchDialogOpen(false);
          table.resetRowSelection();
        },
      }
    );
  };

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
      selectable
      toolbar={
        <TableToolbar
          table={table}
          actions={
            <>
              <BatchScheduleDialog
                open={batchDialogOpen}
                onOpenChange={setBatchDialogOpen}
                onSubmit={handleBatchSubmit}
                disabled={isBatchScheduling}
                mfidCount={selectedMfids.length}
                shouldShowTrigger={selectedMfids.length > 0}
                selectedCount={selectedMfids.length}
                scheduledMfids={scheduledSelectedMfids}
              />
              <MfidFormDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                onSubmit={handleSubmit}
                disabled={isCreatingMfid}
              />
            </>
          }
        />
      }
      onRowClick={onRowClick}
      pagination={<DefaultTablePagination table={table} />}
    />
  );
};
