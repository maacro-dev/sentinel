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
  seasonId,
}: MfidTableProps<T>) => {
  "use no memo";

  const { table, isLoading } = useMfidTable(seasonId);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { createMfid, isLoading: isCreatingMfid } = useCreateMfid();

  const [batchDialogOpen, setBatchDialogOpen] = useState(false);
  const { mutate: batchSchedule, isPending: isBatchScheduling } = useBatchScheduleFieldData();

  const selectedRows = table.getSelectedRowModel().rows;

  const selectedMfids = useMemo(
    () => selectedRows.map(row => row.original.mfid),
    [selectedRows]
  );

  const scheduledSelectedMfids = useMemo(
    () =>
      selectedRows
        .filter(row => (row.original as any).has_scheduling)
        .map(row => (row.original as any).mfid),
    [selectedRows]
  );

  const unscheduledCount = selectedMfids.length - scheduledSelectedMfids.length;

  const selectedLocations = useMemo(() => {
    const provinces = new Set<string>();
    const municipalities = new Set<string>();
    selectedRows.forEach(row => {
      const mfid = row.original as any;
      if (mfid.province) provinces.add(mfid.province);
      if (mfid.city_municipality) municipalities.add(mfid.city_municipality);
    });
    return {
      provinces: Array.from(provinces),
      municipalities: Array.from(municipalities),
    };
  }, [selectedRows]);

  const locationWarning = selectedLocations.municipalities.length > 1;
  const canSchedule = unscheduledCount > 0 && selectedLocations.provinces.length <= 1;

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

  const handleSubmit = useCallback(
    async (payload: MfidFormPayload) => {
      setDialogOpen(false);
      await createMfid(payload);
    },
    [createMfid]
  );

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
                disabled={isBatchScheduling || !canSchedule}
                mfidCount={unscheduledCount}
                shouldShowTrigger={selectedMfids.length > 0}
                selectedCount={selectedMfids.length}
                scheduledMfids={scheduledSelectedMfids}
                locationWarning={locationWarning}
                locations={selectedLocations}
                canSchedule={canSchedule}
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
