import { useDataTable } from "@/core/hooks"
import { useMemo } from "react"
import { getTableColumns } from "@/core/tanstack/table/utils"
import { formGroupConfig, FormType } from "@/routes/_manager/forms/-config"
import { useFormEntries } from "./useFormData"
import { useCurrentSeasonId } from "@/features/fields/hooks/useSeasons"
import { FormColumnDef } from "../columns/defaults"

export const useFormEntriesTable = (
  formType: FormType,
  seasonId: number | undefined | null,
  showSeasonColumn: boolean = false
) => {
  const { data: formData, isLoading } = useFormEntries({ formType, seasonId });
  const { data: currentSeasonId } = useCurrentSeasonId();

  const initialFilters = useMemo(() => {
    if (seasonId !== undefined && seasonId === currentSeasonId) {
      return [{ id: 'activity_verificationStatus', value: ['pending'] }];
    }
    return [];
  }, [seasonId, currentSeasonId]);

  const columns = useMemo(() => {
    const allCols = getTableColumns({ formType, config: formGroupConfig }) as FormColumnDef[];
    return showSeasonColumn ? allCols : allCols.filter(col => !col.seasonal);
  }, [formType, showSeasonColumn]);

  const table = useDataTable({
    data: formData,
    columns,
    getRowId: (row) => String(row.activity.id),
    initialColumnFilters: initialFilters,
  });

  return { table, isLoading, formType };
};
