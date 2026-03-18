import { DataTable, DataTableEvents } from "@/core/components/DataTable";
import { DefaultTablePagination } from "@/core/components/TablePagination";
import { TableSkeleton } from "@/core/components/TableSkeleton";
import { DefaultTableToolbar } from "@/core/components/TableToolbar";
import { useMfidTable } from "../../hooks/useMfidTable";
import { memo, useCallback, useState } from "react";
import { MfidFormDialog } from "../MfidFormDialog";
import { MfidFormInput } from "../../schemas/mfid-create.schema";
import { useCreateMfid } from "../../hooks/useCreateMfid";

export interface MfidTableProps<T> extends DataTableEvents<T> { }

export const MfidTable = <T extends { mfid: string }>({
  onRowClick
}: MfidTableProps<T>) => {
  "use no memo"; // TODO: remove after RC is compatible with TanStack Table v8

  const [dialogOpen, setDialogOpen] = useState(false)
  const { table, isLoading: areMfidLoading } = useMfidTable()

  // @ts-ignore
  const { createMfid, isLoading: isCreatingMfid } = useCreateMfid()

  const handleSubmit = useCallback(
    async (user: MfidFormInput) => {
      setDialogOpen(false)
      await createMfid(user)
    }, [createMfid])

  if (areMfidLoading) {
    return <TableSkeleton />
  }

  return (
    <DataTable
      table={table}
      toolbar={
        <MfidTableToolbar
          onSearchChange={e => table.setGlobalFilter(e.target.value)}
          dialogDisable={false}
          dialogOpen={dialogOpen}
          setDialogOpen={setDialogOpen}
          onDialogSubmit={handleSubmit}
        />
      }
      onRowClick={(row) => {
        onRowClick?.(row);
      }}
      pagination={<DefaultTablePagination table={table} />}
    />
  )
}



interface MfidToolbarProps {
  onSearchChange: React.ChangeEventHandler<HTMLInputElement>
  dialogDisable: boolean
  dialogOpen: boolean
  setDialogOpen: (v: boolean) => void
  onDialogSubmit: (user: MfidFormInput) => Promise<void>
}

const MfidTableToolbar = memo(({
  onSearchChange,
  dialogDisable,
  dialogOpen,
  setDialogOpen,
  onDialogSubmit,
}: MfidToolbarProps) => {
  return (
    <DefaultTableToolbar
      onSearchChange={onSearchChange}
      actions={
        <MfidFormDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onSubmit={onDialogSubmit}
          disabled={dialogDisable}
        />
      }
    />
  )
})
