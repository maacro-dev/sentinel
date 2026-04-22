import { DataTable, DataTableEvents } from "@/core/components/DataTable";
import { DefaultTablePagination } from "@/core/components/TablePagination";
import { TableSkeleton } from "@/core/components/TableSkeleton";
import { useMfidTable } from "../../hooks/useMfidTable";
import { memo, useCallback, useState } from "react";
import { MfidFormDialog, MfidFormPayload } from "../MfidFormDialog";
import { useCreateMfid } from "../../hooks/useCreateMfid";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/core/components/ui/select";
import { DefaultTableToolbar } from "@/core/components/TableToolbar";

export interface MfidTableProps<T> extends DataTableEvents<T> { }

export const MfidTable = <T extends { mfid: string }>({
  onRowClick
}: MfidTableProps<T>) => {
  "use no memo";

  const [statusFilter, setStatusFilter] = useState<'all' | 'available' | 'assigned'>('all');
  const { table, isLoading } = useMfidTable(statusFilter);
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
        <MfidTableToolbar
          onSearchChange={e => table.setGlobalFilter(e.target.value)}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          dialogOpen={dialogOpen}
          setDialogOpen={setDialogOpen}
          onDialogSubmit={handleSubmit}
          dialogDisabled={isCreatingMfid}
        />
      }
      onRowClick={onRowClick}
      pagination={<DefaultTablePagination table={table} />}
    />
  );
};

interface MfidToolbarProps {
  onSearchChange: React.ChangeEventHandler<HTMLInputElement>;
  statusFilter: 'all' | 'available' | 'assigned';
  onStatusFilterChange: (value: 'all' | 'available' | 'assigned') => void;
  dialogOpen: boolean;
  setDialogOpen: (v: boolean) => void;
  onDialogSubmit: (payload: MfidFormPayload) => Promise<void>;
  dialogDisabled: boolean;
}

const MfidTableToolbar = memo(({
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  dialogOpen,
  setDialogOpen,
  onDialogSubmit,
  dialogDisabled,
}: MfidToolbarProps) => {
  return (
    <div className="w-full flex justify-between items-center gap-2">
      <div className="flex gap-4">
        <DefaultTableToolbar
          onSearchChange={onSearchChange}
          actions={null}
        />
      </div>
      <div className="flex gap-2">
        <Select value={statusFilter} onValueChange={(val) => onStatusFilterChange(val as any)}>
          <SelectTrigger className="w-32 text-xs text-muted-foreground shadow-none">
            <SelectValue placeholder="All" className="text-muted-foreground" />
          </SelectTrigger>
          <SelectContent position="popper">
            <SelectItem className="text-xs" value="all">All</SelectItem>
            <SelectItem className="text-xs" value="available">Available</SelectItem>
            <SelectItem className="text-xs" value="assigned">Assigned</SelectItem>
          </SelectContent>
        </Select>
        <MfidFormDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onSubmit={onDialogSubmit}
          disabled={dialogDisabled}
        />
      </div>
    </div>
  );
});
