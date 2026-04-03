import { DataTable, DataTableEvents } from "@/core/components/DataTable";
import { DefaultTablePagination } from "@/core/components/TablePagination";
import { TableSkeleton } from "@/core/components/TableSkeleton";
import { DefaultTableToolbar } from "@/core/components/TableToolbar";
import { CollectionTask, CollectionTaskInput } from "../../schemas/collection.schema";
import { useCollectionTable } from "../../hooks/useCollectionTable";
import { CollectionFormDialog } from "../CollectionFormDialog";
import { memo, useState } from "react";
import { useCreateCollectionTask } from "../../hooks/useCreateCollectionTask";

interface CollectionTableProps extends DataTableEvents<CollectionTask> {
  seasonId?: number;
}

export function CollectionTable({ seasonId, onRowClick }: CollectionTableProps) {

  const { table, isLoading } = useCollectionTable(seasonId)
  const [dialogOpen, setDialogOpen] = useState(false);

  const { mutate: createTask, isPending: isCreating } = useCreateCollectionTask();

  const handleCreate = async (input: CollectionTaskInput) => {
    createTask(input, {
      onSuccess: () => {
        setDialogOpen(false);
      },
    });
  };

  if (isLoading) return <TableSkeleton />;

  return (
    <DataTable
      table={table}
      toolbar={
        <CollectionTableToolbar
          onSearchChange={(e) => table.setGlobalFilter(e.target.value)}
          dialogOpen={dialogOpen}
          setDialogOpen={setDialogOpen}
          onDialogSubmit={handleCreate}
          dialogDisabled={isCreating}
        />
      }
      onRowClick={onRowClick}
      pagination={<DefaultTablePagination table={table} />}
    />
  );
}


interface CollectionToolbarProps {
  onSearchChange: React.ChangeEventHandler<HTMLInputElement>;
  dialogOpen: boolean;
  setDialogOpen: (v: boolean) => void;
  onDialogSubmit: (task: CollectionTaskInput) => Promise<void>;
  dialogDisabled: boolean;
}

const CollectionTableToolbar = memo(({
  onSearchChange,
  dialogOpen,
  setDialogOpen,
  onDialogSubmit,
  dialogDisabled,
}: CollectionToolbarProps) => {
  return (
    <div className="w-full flex justify-between items-center gap-2">
      <div className="flex gap-4">
        <DefaultTableToolbar
          onSearchChange={onSearchChange}
          actions={null}
        />
      </div>
      <div className="flex gap-2">
        <CollectionFormDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          onSubmit={onDialogSubmit}
          disabled={dialogDisabled}
        />
      </div>
    </div>
  );
});
