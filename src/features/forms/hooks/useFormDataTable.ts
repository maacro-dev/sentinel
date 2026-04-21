import { useDataTable } from "@/core/hooks"
import { useMemo } from "react"
import { getTableColumns } from "@/core/tanstack/table/utils"
import { formGroupConfig, FormType } from "@/routes/_manager/forms/-config"
import { useFormEntries } from "./useFormData"

export const useFormEntriesTable = (formType: FormType, seasonId?: number) => {
  const { data: formData, isLoading } = useFormEntries({ formType, seasonId });
  const columns = useMemo(() => getTableColumns({ formType, config: formGroupConfig }), [formType]);
  const table = useDataTable({
    data: formData,
    columns: columns,
    getRowId: (row) => String(row.activity.id),
    initialSorting: [{ id: 'activity_verificationStatus', desc: false }],
  });
  return { table, isLoading, formType };
};
