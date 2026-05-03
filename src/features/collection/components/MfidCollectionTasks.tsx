import { getActivityTypeLabel } from "@/features/forms/utils";
import { useState, useMemo, useCallback } from "react";
import { CollectionFormDialog } from "./CollectionFormDialog";
import { useCreateCollectionTask } from "../hooks/useCreateCollectionTask";
import { useCollectionTasksByMfid } from "../hooks/useCollectionTaskByMfid";
import { ActivityType, CoreMetadataType } from "@/features/forms/schemas/forms";
import { CollectionTask } from "../schemas/collection.schema";
import { useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useUpdateCollectionTask } from "../hooks/useUpdateCollectionTask";
import { useDeleteCollectionTask } from "../hooks/useDeleteCollectionTask";
import { CollectionFormDeleteDialog } from "./CollectionFormDeleteDialog";
import { useUpdateFieldDataWithCascade } from "../hooks/useUpdateFieldDataWithCascade";
import { SeasonCell } from "@/core/components/cells/SeasonCell";
import { CORE_GROUPS } from "../services/config";
import { CollectionTasksTable } from "./CollectionTasksTable/CollectionTasksTable";
import { useScheduleCore } from "../hooks/useScheduleCore";


interface MfidCollectionTasksProps {
  mfid: string;
  seasonId?: number | null;
}

export function MfidCollectionTasks({ mfid, seasonId }: MfidCollectionTasksProps) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: allTasks, isLoading } = useCollectionTasksByMfid(mfid, seasonId);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedFormType, setSelectedFormType] = useState<ActivityType | undefined>();
  const [retakeOriginalTask, setRetakeOriginalTask] = useState<CollectionTask | undefined>();
  const [editingTask, setEditingTask] = useState<CollectionTask | undefined>();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<CollectionTask | null>(null);

  const [selectedSeasonId, setSelectedSeasonId] = useState<number | null>(null);

  const { mutate: createTask, isPending: isCreating } = useCreateCollectionTask();

  const { mutate: updateTask, isPending: isUpdating } = useUpdateCollectionTask();

  const { mutate: updateFieldDataAndCascade } = useUpdateFieldDataWithCascade();

  const { mutate: deleteTask } = useDeleteCollectionTask();

  const { mutate: scheduleAll, isPending: isSchedulingAll } = useScheduleCore();

  const handleDeleteTask = useCallback((task: CollectionTask) => {
    setTaskToDelete(task);
    setDeleteDialogOpen(true);
  }, []);

  const confirmDelete = useCallback(() => {
    if (taskToDelete) {
      deleteTask(taskToDelete.id, {
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["collection-tasks", mfid] }),
      });
      setTaskToDelete(null);
    }
  }, [taskToDelete, deleteTask, mfid, queryClient]);

  const handleCreateTask = useCallback((formType: ActivityType, seasonId: number) => {
    setSelectedFormType(formType);
    setRetakeOriginalTask(undefined);
    setEditingTask(undefined);
    setSelectedSeasonId(seasonId);
    setDialogOpen(true);
  }, []);

  const handleRetakeTask = useCallback((task: CollectionTask) => {
    setRetakeOriginalTask(task);
    setSelectedFormType(undefined);
    setEditingTask(undefined);
    setSelectedSeasonId(task.season_id);
    setDialogOpen(true);
  }, []);

  const handleEditTask = useCallback((task: CollectionTask) => {
    setEditingTask(task);
    setSelectedFormType(undefined);
    setRetakeOriginalTask(undefined);
    setSelectedSeasonId(task.season_id);
    setDialogOpen(true);
  }, []);

  const handleViewForm = useCallback((task: CollectionTask) => {
    if (task.activity_id) {
      navigate({
        to: '/forms/$formType/$id',
        params: { formType: task.activity_type, id: task.activity_id },
      });
    }
  }, [navigate]);

  const effectiveSeasonForDialog = selectedSeasonId ?? seasonId ?? undefined;

  const dialogTasks = useMemo(() => {
    if (!allTasks) return [];
    const sid = effectiveSeasonForDialog;
    if (sid != null) {
      return allTasks.filter(t => t.season_id === sid);
    }
    return allTasks;
  }, [allTasks, effectiveSeasonForDialog]);

  const dateConstraints = useMemo(() => {
    const result: Record<string, { minStart?: Date; maxEnd?: Date }> = {};
    const excludeId = editingTask?.id;
    const tasksForSeason = dialogTasks.filter(t => t.id !== excludeId);

    for (let gIdx = 0; gIdx < CORE_GROUPS.length; gIdx++) {
      const group = CORE_GROUPS[gIdx];

      let minStart: Date | undefined;
      if (gIdx > 0) {
        const prevGroupTypes = CORE_GROUPS[gIdx - 1];
        const prevTasks = tasksForSeason.filter(
          t => prevGroupTypes.includes(t.activity_type as CoreMetadataType)
        );
        if (prevTasks.length > 0) {
          const latestEnd = prevTasks.reduce((latest, t) => {
            const end = new Date(t.end_date + 'T00:00:00');
            return end > latest ? end : latest;
          }, new Date(0));
          minStart = new Date(latestEnd);
          minStart.setDate(minStart.getDate() + 1);
        }
      }

      let maxEnd: Date | undefined;
      if (gIdx < CORE_GROUPS.length - 1) {
        const nextGroupTypes = CORE_GROUPS[gIdx + 1];
        const nextTasks = tasksForSeason.filter(
          t => nextGroupTypes.includes(t.activity_type as CoreMetadataType)
        );
        if (nextTasks.length > 0) {
          const earliestStart = nextTasks.reduce((earliest, t) => {
            const start = new Date(t.start_date + 'T00:00:00');
            return start < earliest ? start : earliest;
          }, new Date(8640000000000));
          maxEnd = new Date(earliestStart);
          maxEnd.setDate(maxEnd.getDate() - 1);
        }
      }

      group.forEach(formType => {
        result[formType] = { minStart, maxEnd };
      });
    }

    return result;
  }, [dialogTasks, editingTask?.id]);

  const currentActivityType = editingTask
    ? (editingTask.activity_type as CoreMetadataType)
    : selectedFormType as CoreMetadataType | undefined;

  const constraints = currentActivityType ? dateConstraints[currentActivityType] ?? {} : {};
  const minStartDate = constraints.minStart;
  const maxEndDate = constraints.maxEnd;

  const handleCreate = useCallback((input: any) => {
    if (selectedFormType === 'field-data') {
      scheduleAll(input, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ["collection-tasks", mfid] });
          setDialogOpen(false);
          closeDialog();
        },
        onError: (error) => console.log(error),
      });
      return;
    }
    createTask(input, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["collection-tasks", mfid] });
        setDialogOpen(false);
        closeDialog();
      },
    });
  }, [selectedFormType, scheduleAll, createTask, mfid, queryClient]);

  const handleUpdate = useCallback((input: any) => {
    if (!editingTask) return;
    if (editingTask.activity_type === 'field-data') {
      updateFieldDataAndCascade(
        { id: editingTask.id, mfid: editingTask.mfid, ...input },
        {
          onSuccess: () => {
            setDialogOpen(false);
            setEditingTask(undefined);
          },
        }
      );
      return;
    }
    updateTask(
      { id: editingTask.id, mfid: editingTask.mfid, ...input },
      {
        onSuccess: () => {
          setDialogOpen(false);
          setEditingTask(undefined);
        },
      }
    );
  }, [editingTask, updateFieldDataAndCascade, updateTask]);

  const closeDialog = () => {
    setSelectedFormType(undefined);
    setRetakeOriginalTask(undefined);
    setEditingTask(undefined);
    setSelectedSeasonId(null);
  };

  const tasksBySeason = useMemo(() => {
    if (!allTasks || seasonId != null) return null;
    const map = new Map<number, CollectionTask[]>();
    allTasks.forEach(task => {
      const existing = map.get(task.season_id) || [];
      existing.push(task);
      map.set(task.season_id, existing);
    });
    return Array.from(map.entries()).sort(([a], [b]) => a - b);
  }, [allTasks, seasonId]);

  if (isLoading) return <div className="text-sm text-muted-foreground">Loading tasks...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <CollectionFormDialog
          open={dialogOpen}
          onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) closeDialog();
          }}
          onSubmit={editingTask ? handleUpdate : handleCreate}
          disabled={isCreating || isUpdating || isSchedulingAll}
          mfid={mfid}
          seasonId={effectiveSeasonForDialog}
          activityType={selectedFormType}
          originalTask={retakeOriginalTask}
          editingTask={editingTask}
          hideTrigger={true}
          minStartDate={minStartDate}
          maxStartDateOverride={editingTask?.activity_type === 'field-data' ? null : undefined}
          maxEndDate={maxEndDate}
        />
      </div>

      {seasonId != null ? (
        <CollectionTasksTable
          seasonId={seasonId as number}
          tasks={allTasks?.filter(t => t.season_id === seasonId) ?? []}
          onCreate={handleCreateTask}
          onRetake={handleRetakeTask}
          onEdit={handleEditTask}
          onView={handleViewForm}
          onDelete={handleDeleteTask}
        />
      ) : (
        tasksBySeason!.map(([sid, tasks]) => (
          <div key={sid}>
            <div className="flex items-center gap-2 mt-6 first:mt-0">
              <h3 className="text-lg font-semibold">
                <SeasonCell seasonId={sid} />
              </h3>
            </div>
            <CollectionTasksTable
              seasonId={sid}
              tasks={tasks}
              onCreate={handleCreateTask}
              onRetake={handleRetakeTask}
              onEdit={handleEditTask}
              onView={handleViewForm}
              onDelete={handleDeleteTask}
            />
          </div>
        ))
      )}

      <CollectionFormDeleteDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={confirmDelete}
        title="Delete Collection Task"
        description={`Are you sure you want to delete the task for ${taskToDelete ? getActivityTypeLabel(taskToDelete.activity_type) : "this task"}? This action cannot be undone.`}
      />
    </div>
  );
}



