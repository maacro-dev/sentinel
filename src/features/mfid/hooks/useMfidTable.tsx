
import { useDataTable } from "@/core/hooks"
import { useMemo } from "react"
import { getTableColumnsByPath } from "@/core/tanstack/table/utils"
import { useMfids } from "./useMfids"
import { dataGroupConfig } from "@/routes/_manager/_data/-config"

export const useMfidTable = (statusFilter: 'all' | 'available' | 'used' = 'all') => {
  const { data: mfids, isLoading } = useMfids()
  const filteredData = useMemo(() => {
    if (statusFilter === 'all') return mfids
    return mfids.filter(m => m.status === statusFilter)
  }, [mfids, statusFilter])
  const columns = useMemo(() => {
    return getTableColumnsByPath({
      path: "/mfid",
      config: dataGroupConfig
    })
  }, [])
  const table = useDataTable({
    data: filteredData,
    columns: columns,
    getRowId: (row) => row.mfid
  })
  return { table, isLoading, filteredData }
}
