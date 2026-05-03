import { useDataTable } from "@/core/hooks";
import { useCollectionTasks } from "./useCollectionTasks";
import { getCollectionTableColumns } from "../components/CollectionTable/CollectionTableColumns";

export const useCollectionTable = (seasonId: number | undefined | null, showSeasonColumn: boolean) => {

  const { data: tasks, isLoading } = useCollectionTasks(seasonId);

  const columns = getCollectionTableColumns(showSeasonColumn)

  const table = useDataTable({
    data: tasks ?? [],
    columns: columns,
    getRowId: (row) => String(row.id),
    initialColumnFilters: [
      { id: 'verification_status', value: ['pending'] },
      { id: 'status', value: ['pending'] }
    ],
  })

  return { table, isLoading }
}
