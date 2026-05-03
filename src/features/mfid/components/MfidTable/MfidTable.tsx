import { DataTable, DataTableEvents } from "@/core/components/DataTable";
import { DefaultTablePagination } from "@/core/components/TablePagination";
import { TableSkeleton } from "@/core/components/TableSkeleton";
import { useMfidTable } from "../../hooks/useMfidTable";
import { useCallback, useEffect, useMemo, useState } from "react";
import { MfidFormDialog, MfidFormPayload } from "../MfidFormDialog";
import { useCreateMfid } from "../../hooks/useCreateMfid";
import { TableToolbar } from "@/core/components/DataTableToolbar";
import { BatchScheduleDialog, BatchScheduleInput } from "@/features/collection/components/BatchScheduleDialog";
import { LocationBatchScheduleDialog } from "@/features/collection/components/LocationBatchScheduleDialog";
import { useQueryClient } from "@tanstack/react-query";
import { useBatchSchedule } from "@/features/collection/hooks/useBatchSchedule";

export interface MfidTableProps<T> extends DataTableEvents<T> {
  seasonId?: number | null;
}

export const MfidTable = <T extends { mfid: string }>({
  onRowClick,
  onRowIntent,
  seasonId,
}: MfidTableProps<T>) => {
  "use no memo";

  const queryClient = useQueryClient();
  const { table, isLoading, mfids } = useMfidTable(seasonId);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { createMfid, isLoading: isCreatingMfid } = useCreateMfid();
  const [batchDialogOpen, setBatchDialogOpen] = useState(false);
  const [locationDialogOpen, setLocationDialogOpen] = useState(false);
  const { mutate: batchSchedule, isPending: isBatchScheduling } = useBatchSchedule();

  useEffect(() => {
    table.resetRowSelection();
  }, [seasonId, table]);

  const rowSelection = table.getState().rowSelection;
  const selectedMfids = Object.keys(rowSelection);

  const selectedRows = useMemo(
    () => mfids.filter(row => rowSelection[row.mfid]),
    [mfids, rowSelection]
  );

  const scheduledSelectedMfids = useMemo(
    () =>
      selectedRows
        .filter(row => row.has_scheduling)
        .map(row => row.mfid),
    [selectedRows]
  );

  const unscheduledCount = selectedMfids.length - scheduledSelectedMfids.length;

  const selectedLocations = useMemo(() => {
    const provinces = new Set<string>();
    const municipalities = new Set<string>();
    selectedRows.forEach(row => {
      if (row.province) provinces.add(row.province);
      if (row.city_municipality) municipalities.add(row.city_municipality);
    });
    return {
      provinces: Array.from(provinces),
      municipalities: Array.from(municipalities),
    };
  }, [selectedRows]);

  const provinceWarning = selectedLocations.provinces.length > 1;
  const municipalityWarning = selectedLocations.municipalities.length > 1;

  const seasonAvailable = seasonId != null;
  const canSchedule = seasonAvailable && unscheduledCount > 0;

  const handleBatchSubmit = (input: BatchScheduleInput) => {
    if (!seasonAvailable) return;
    batchSchedule(
      {
        mfids: selectedMfids,
        seasonId: seasonId!,
        collectorId: input.collector_id,
        startDate: input.start_date,
        endDate: input.end_date,
      },
      {
        onSuccess: () => {
          setBatchDialogOpen(false);
          table.resetRowSelection();
          queryClient.invalidateQueries({ queryKey: ["mfids", seasonId] });
          queryClient.invalidateQueries({ queryKey: ["collection-tasks"] });
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
                shouldShowTrigger={selectedMfids.length > 0 && seasonAvailable}
                selectedCount={selectedMfids.length}
                scheduledMfids={scheduledSelectedMfids}
                locationWarning={municipalityWarning}
                provinceWarning={provinceWarning}
                locations={selectedLocations}
                canSchedule={canSchedule}
              />
              <LocationBatchScheduleDialog
                open={locationDialogOpen}
                onOpenChange={setLocationDialogOpen}
                seasonId={seasonId}
                onScheduled={() => {
                  queryClient.invalidateQueries({ queryKey: ["mfids", seasonId] });
                  queryClient.invalidateQueries({ queryKey: ["collection-tasks"] });
                  table.resetRowSelection();
                }}
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
      onRowIntent={onRowIntent}
      pagination={<DefaultTablePagination table={table} />}
    />
  );
};
