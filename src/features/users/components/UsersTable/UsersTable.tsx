import { DataTable } from "@/core/components/DataTable"
import { TableSkeleton } from "@/core/components/TableSkeleton"
import { useState, useCallback } from "react"
import { useCreateUser } from "../../hooks/useCreateUser"
import { useUsersTable } from "../../hooks/useUsersTable"
import { UserFormInput } from "../../schemas"
import { UsersTableToolbar } from "./UsersTableToolbar"

export function UsersTable({ includeAdmin }: { includeAdmin: boolean }) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const { table, isLoading: areUsersLoading } = useUsersTable(includeAdmin)
  const { createUser, isLoading: isCreatingUser } = useCreateUser()

  const handleSubmit = useCallback(
    async (user: UserFormInput) => {
      await createUser(user)
      setDialogOpen(false)
    },[createUser])

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
    />
  )
}
