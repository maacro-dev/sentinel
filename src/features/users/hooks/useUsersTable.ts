import { useDataTable } from "@/core/hooks"
import { useMemo } from "react"
import { UserColumns } from "../components/UsersTable/UserColumns"
import { useUsers } from "./useUsers"

export const useUsersTable = (includeAdmin: boolean) => {
  const { data: users, isLoading } = useUsers({ includeAdmin })
  const columns = useMemo(() => UserColumns, [])
  const table = useDataTable({
    data: users,
    columns: columns,
  })

  return { table, isLoading }
}
