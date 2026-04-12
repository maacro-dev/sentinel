import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Collection } from "../services/Collection";
import { CollectionTaskInput } from "../schemas/collection.schema";
import { useToast } from "@/features/toast";

const UpdateToasts = {
  updating: { message: 'Updating task', description: 'Please wait...' },
  updated: { message: 'Task updated', description: 'The task has been updated successfully' },
  updateFailed: { message: 'Failed to update task', description: 'The task could not be updated' },
};

export function useUpdateCollectionTask() {
  const queryClient = useQueryClient();
  const { notifyLoading, notifySuccess, notifyError } = useToast();

  return useMutation({
    mutationFn: ({ id, ...input }: { id: number } & Partial<CollectionTaskInput>) =>
      Collection.update(id, input),
    onMutate: () => notifyLoading(UpdateToasts.updating),
    onSuccess: (_, variables, toastId) => {
      notifySuccess({ id: toastId, ...UpdateToasts.updated });
      queryClient.invalidateQueries({ queryKey: ['collection-tasks'] });
      if (variables.mfid) {
        queryClient.invalidateQueries({ queryKey: ['collection-tasks', variables.mfid] });
      }
    },
    onError: (error, _variables, toastId) => {
      console.error('Update failed:', error);
      notifyError({ id: toastId, ...UpdateToasts.updateFailed });
    },
  });
}
