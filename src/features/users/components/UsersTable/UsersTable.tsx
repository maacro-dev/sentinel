import { DataTable } from "@/core/components/DataTable"
import { TableSkeleton } from "@/core/components/TableSkeleton"
import { useState, useCallback, memo, ChangeEvent } from "react"
import { useCreateUser } from "../../hooks/useCreateUser"
import { useUsersTable } from "../../hooks/useUsersTable"
import { UserFormInput } from "../../schemas"
import { UserFormDialog } from "../UserFormDialog"
import { DefaultTablePagination } from "@/core/components/TablePagination"
import { DefaultTableToolbar } from "@/core/components/TableToolbar"


interface UsersToolbarProps {
  onSearchChange: React.ChangeEventHandler<HTMLInputElement>
  dialogDisable: boolean
  dialogOpen: boolean
  setDialogOpen: (v: boolean) => void
  onDialogSubmit: (user: UserFormInput) => Promise<void>
}

const UsersTableToolbar = memo(({
  onSearchChange,
  dialogDisable,
  dialogOpen,
  setDialogOpen,
  onDialogSubmit,
}: UsersToolbarProps) => {
  return (
    <DefaultTableToolbar
      onSearchChange={onSearchChange}
      actions={
        <UserFormDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onSubmit={onDialogSubmit}
          disabled={dialogDisable}
        />
      }
    />
  )
})


export function UsersTable({ includeAdmin }: { includeAdmin: boolean }) {
  "use no memo"; // TODO: remove after RC is compatible with TanStack Table v8

  const [dialogOpen, setDialogOpen] = useState(false)
  const { table, isLoading: areUsersLoading } = useUsersTable(includeAdmin)
  const { createUser, isLoading: isCreatingUser } = useCreateUser()

  const handleSubmit = useCallback(
    async (user: UserFormInput) => {
      setDialogOpen(false)
      await createUser(user)
    }, [createUser])

  if (areUsersLoading) {
    return <TableSkeleton />
  }

  return (
    <DataTable
      table={table}
      toolbar={
        <UsersTableToolbar
          onSearchChange={e => table.setGlobalFilter(e.target.value)}
          dialogDisable={isCreatingUser}
          dialogOpen={dialogOpen}
          setDialogOpen={setDialogOpen}
          onDialogSubmit={handleSubmit}
        />
      }
      pagination={<DefaultTablePagination table={table} />}
    />
  )
}
