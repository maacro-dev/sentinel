import { useDataTable } from "@/core/hooks";
import { getTableColumnsByPath } from "@/core/tanstack/table/utils";
import { useMemo } from "react";
import { useCollectionTasks } from "./useCollectionTasks";
import { overviewGroupConfig } from "@/routes/_manager/_overview/-config";

export const useCollectionTable = (seasonId?: number) => {

  const { data: tasks, isLoading } = useCollectionTasks(seasonId);

  const columns = useMemo(() => {
    return getTableColumnsByPath({
      path: "/collection",
      config: overviewGroupConfig
    })
  }, [])

  const table = useDataTable({
    data: tasks ?? [],
    columns: columns,
    getRowId: (row) => row.id
  })

  return { table, isLoading }
}
