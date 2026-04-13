import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Collection } from "../services/Collection";
import { useToast } from "@/features/toast";

const DeleteToasts = {
  deleting: { message: 'Deleting task', description: 'Please wait...' },
  deleted: { message: 'Task deleted', description: 'The task has been deleted successfully' },
  deleteFailed: { message: 'Failed to delete task', description: 'The task could not be deleted' },
};

export function useDeleteCollectionTask() {
  const queryClient = useQueryClient();
  const { notifyLoading, notifySuccess, notifyError } = useToast();

  return useMutation({
    mutationFn: (taskId: number) => Collection.delete(taskId),
    onMutate: () => notifyLoading(DeleteToasts.deleting),
    onSuccess: (_, _taskId, toastId) => notifySuccess({ id: toastId, ...DeleteToasts.deleted }),
    onError: (error, _taskId, toastId) => {
      console.error('Delete failed:', error);
      notifyError({ id: toastId, ...DeleteToasts.deleteFailed });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['collection-tasks'] });
    }
  });
}
