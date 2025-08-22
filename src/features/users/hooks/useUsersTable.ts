import { useDataTable } from "@/core/hooks"
import { useMemo } from "react"
import { useUsers } from "./useUsers"
import { getTableColumnsByPath } from "@/core/tanstack/util"
import { adminAccessControlGroupConfig } from "@/routes/admin/_accessControl/-config"

export const useUsersTable = (includeAdmin: boolean) => {
  const { data: users, isLoading } = useUsers({ includeAdmin })
  const columns = useMemo(() => {
    return getTableColumnsByPath({
      path: "/admin/user-management",
      config: adminAccessControlGroupConfig
    })
  }, [])
  const table = useDataTable({
    data: users,
    columns: columns,
  })

  return { table, isLoading }
}
