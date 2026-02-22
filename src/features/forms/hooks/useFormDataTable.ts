import { useDataTable } from "@/core/hooks"
import { useMemo } from "react"
import { getTableColumns } from "@/core/tanstack/table/utils"
import { formGroupConfig, FormType } from "@/routes/_manager/forms/-config"
import { useFormEntries } from "./useFormData"

export const useFormEntriesTable = (formType: FormType) => {
  const { data: formData, isLoading } = useFormEntries({ formType })
  const columns = useMemo(() => getTableColumns({ formType, config: formGroupConfig }), [formType])
  const table = useDataTable({
    data: formData,
    columns: columns,
    getRowId: (row) => row.field.mfid
  })
  return { table, isLoading, formType }
}
