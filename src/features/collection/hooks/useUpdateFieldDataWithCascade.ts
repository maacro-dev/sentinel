import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Collection } from "../services/Collection";
import { useToast } from "@/features/toast";

const Toasts = {
  updating: { message: 'Updating schedule', description: 'Please wait...' },
  updated: { message: 'Schedule updated', description: 'All linked dates have been shifted' },
  updateFailed: { message: 'Update failed', description: 'Could not update schedule' },
};

export function useUpdateFieldDataWithCascade() {
  const queryClient = useQueryClient();
  const { notifyLoading, notifySuccess, notifyError } = useToast();

  return useMutation({
    mutationFn: ({ id, collector_id, start_date, end_date }: {
      id: number;
      collector_id?: string;
      start_date?: string;
      end_date?: string;
      mfid?: string;
    }) => Collection.updateFieldDataWithCascade(id, { collector_id, start_date, end_date }),
    onMutate: () => notifyLoading(Toasts.updating),
    onSuccess: (_, variables, toastId) => {
      notifySuccess({ id: toastId, ...Toasts.updated });
      queryClient.invalidateQueries({ queryKey: ['collection-tasks'] });
      if (variables.mfid) {
        queryClient.invalidateQueries({ queryKey: ['collection-tasks', variables.mfid] });
      }
    },
    onError: (error, _variables, toastId) => {
      console.error('Update failed:', error);
      notifyError({ id: toastId, ...Toasts.updateFailed });
    },
  });
}
