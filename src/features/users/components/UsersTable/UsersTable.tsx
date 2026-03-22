import { DataTable } from "@/core/components/DataTable"
import { TableSkeleton } from "@/core/components/TableSkeleton"
import { useState, useCallback, memo, createContext, useContext } from "react"
import { useCreateUser } from "../../hooks/useCreateUser"
import { useUsersTable } from "../../hooks/useUsersTable"
import { User, UserFormInput } from "../../schemas"
import { UserFormDialog } from "../UserFormDialog"
import { DefaultTablePagination } from "@/core/components/TablePagination"
import { DefaultTableToolbar } from "@/core/components/TableToolbar"
import { UserDetailsDialog } from "../UserDetails/UserDetailsDialog"

interface UsersToolbarProps {
  onSearchChange: React.ChangeEventHandler<HTMLInputElement>
  createDialogDisable: boolean
  createDialogOpen: boolean
  setCreateDialogOpen: (v: boolean) => void
  onCreateDialogSubmit: (user: UserFormInput) => Promise<void>
}

const UsersTableToolbar = memo(({
  onSearchChange,
  createDialogDisable,
  createDialogOpen,
  setCreateDialogOpen,
  onCreateDialogSubmit,
}: UsersToolbarProps) => {
  return (
    <DefaultTableToolbar
      onSearchChange={onSearchChange}
      actions={
        <UserFormDialog
          open={createDialogOpen}
          onOpenChange={setCreateDialogOpen}
          onSubmit={onCreateDialogSubmit}
          disabled={createDialogDisable}
        />
      }
    />
  )
})

export function UsersTable({ includeAdmin }: { includeAdmin: boolean }) {
  "use no memo"; // TODO: remove when RC is compatible with TanStack Table v8

  const [createDialogOpen, setCreateDialogOpen] = useState(false)

  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  const { table, isLoading: areUsersLoading } = useUsersTable(includeAdmin)
  const { createUser, isLoading: isCreatingUser } = useCreateUser()

  const handleSubmit = useCallback(
    async (user: UserFormInput) => {
      setCreateDialogOpen(false)
      await createUser(user)
    }, [createUser])

  const openDetails = useCallback((user: User) => {
    setSelectedUser(user)
    setDetailsDialogOpen(true)
  }, [])

  if (areUsersLoading) {
    return <TableSkeleton />
  }

  return (
    <UserDetailsContext.Provider value={{ openDetails }}>
      <DataTable
        table={table}
        toolbar={
          <UsersTableToolbar
            onSearchChange={e => table.setGlobalFilter(e.target.value)}
            createDialogDisable={isCreatingUser}
            createDialogOpen={createDialogOpen}
            setCreateDialogOpen={setCreateDialogOpen}
            onCreateDialogSubmit={handleSubmit}
          />
        }
        pagination={<DefaultTablePagination table={table} />}
      />
      <UserDetailsDialog
        user={selectedUser}
        open={detailsDialogOpen}
        onOpenChange={setDetailsDialogOpen}
        onUserUpdated={(updatedUser) => setSelectedUser(updatedUser)}
      />
    </UserDetailsContext.Provider>
  )
}

const UserDetailsContext = createContext<{ openDetails: (user: User) => void } | undefined>(undefined)

export const useUserDetails = () => {
  const context = useContext(UserDetailsContext)
  if (!context) {
    throw new Error("useUserDetails must be used within a UserDetailsProvider")
  }
  return context
}
