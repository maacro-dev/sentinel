
import { useDataTable } from "@/core/hooks"
import { useMemo } from "react"
import { getTableColumnsByPath } from "@/core/tanstack/table/utils"
import { useMfids } from "./useMfids"
import { dataGroupConfig } from "@/routes/_manager/_data/-config"

export const useMfidTable = (seasonId?: number | null) => {
  const { data: mfids, isLoading } = useMfids(seasonId)

  const columns = useMemo(() => {
    return getTableColumnsByPath({
      path: "/mfid",
      config: dataGroupConfig
    })
  }, [])

  const table = useDataTable({
    data: mfids,
    columns: columns,
    getRowId: (row) => row.mfid,
    enableMultiSelect: true,
  })

  return { table, isLoading, mfids }
}
