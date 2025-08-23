import { useDataTable } from "@/core/hooks"
import { useMemo } from "react"
import { getTableColumns } from "@/core/tanstack/util"
import { formGroupConfig, FormRouteType } from "@/routes/_manager/forms/-config"
import { useFormEntries } from "./useFormData"

export const useFormEntriesTable = (formType: FormRouteType) => {
  const { data: formData, isLoading } = useFormEntries({ formType })
  const columns = useMemo(() => getTableColumns({ formType, config: formGroupConfig }), [formType])
  const table = useDataTable({
    data: formData,
    columns: columns,
    getRowId: (row) => row.mfid,
  })

  return { table, isLoading, formType }
}
