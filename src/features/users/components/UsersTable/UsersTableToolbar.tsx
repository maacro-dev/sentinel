import { SearchBar } from "@/core/components/SearchBar"
import { memo } from "react"
import { UserFormInput } from "../../schemas"
import { UserFormDialog } from "../UserFormDialog"

export const UsersTableToolbar = memo(function UsersToolbar({
  onSearchChange,
  dialogDisable,
  dialogOpen,
  setDialogOpen,
  onDialogSubmit,
}: {
  onSearchChange: React.ChangeEventHandler<HTMLInputElement>
  dialogDisable: boolean
  dialogOpen: boolean
  setDialogOpen: (v: boolean) => void
  onDialogSubmit: (user: UserFormInput) => Promise<void>
}) {
  return (
    <div className="w-full flex justify-between">
      <SearchBar
        containerClassName="w-64"
        className="text-xs"
        placeholder="Search name or email"
        onChange={onSearchChange}
      />
      <UserFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={onDialogSubmit}
        disabled={dialogDisable}
      />
    </div>
  )
})
