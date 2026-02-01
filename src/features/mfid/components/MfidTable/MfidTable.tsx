import { DataTable, DataTableEvents } from "@/core/components/DataTable";
import { DefaultTablePagination } from "@/core/components/TablePagination";
import { TableSkeleton } from "@/core/components/TableSkeleton";
import { DefaultTableToolbar } from "@/core/components/TableToolbar";
import { useMfidTable } from "../../hooks/useMfidTable";
import { memo, useState } from "react";
import { MfidFormDialog } from "../MfidFormDialog";
import { MfidFormInput } from "../../schemas/mfid-create.schema";

export interface MfidTableProps<T> extends DataTableEvents<T> { }

export const MfidTable = <T extends { mfid: string }>({
  onRowClick
}: MfidTableProps<T>) => {
  "use no memo"; // TODO: remove after RC is compatible with TanStack Table v8

  const [dialogOpen, setDialogOpen] = useState(false)
  const { table, isLoading: areMfidLoading } = useMfidTable()

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
          onDialogSubmit={async (input) => {
            console.log("input =", input)
          }}
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
