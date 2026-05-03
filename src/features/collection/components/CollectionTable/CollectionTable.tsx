import { DataTable, DataTableEvents } from "@/core/components/DataTable";
import { DefaultTablePagination } from "@/core/components/TablePagination";
import { TableSkeleton } from "@/core/components/TableSkeleton";
import { CollectionTask } from "../../schemas/collection.schema";
import { useCollectionTable } from "../../hooks/useCollectionTable";
import { TableToolbar } from "@/core/components/DataTableToolbar";

interface CollectionTableProps extends DataTableEvents<CollectionTask> {
  seasonId: number | undefined | null;
  showSeasonColumn: boolean;
}

export function CollectionTable({ seasonId, showSeasonColumn, onRowClick }: CollectionTableProps) {
  "use no memo";

  const { table, isLoading } = useCollectionTable(seasonId, showSeasonColumn)

  if (isLoading) return <TableSkeleton />;

  return (
    <DataTable
      table={table}
      toolbar={
        <TableToolbar table={table} />
      }
      onRowClick={onRowClick}
      pagination={<DefaultTablePagination table={table} />}
    />
  );
}

