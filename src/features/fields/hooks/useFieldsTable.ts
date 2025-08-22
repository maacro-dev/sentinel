import { useMemo } from "react"
import { useFields } from "./useFields"
import { useDataTable } from "@/core/hooks"
import { getTableColumnsByPath } from "@/core/tanstack/util"
import { overviewGroupConfig } from "@/routes/_manager/_overview/-config"

export const useFieldsTable = () => {
  const { data: fields, isLoading } = useFields()
  const columns = useMemo(() => getTableColumnsByPath({ path: "/monitored-fields", config: overviewGroupConfig }), [])
  const table = useDataTable({
    data: fields,
    columns: columns,
  })

  return { table, isLoading }
}
