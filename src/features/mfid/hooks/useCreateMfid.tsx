
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/features/toast";
import { mfidsQueryOptions } from "../queries/options";
import { Mfid } from "../services/Mfid";

const ToastMessages = {
  creating: { message: 'Creating mfid', description: 'Please wait...' },
  created: { message: 'Mfid created', description: 'The mfid has been created successfully' },
  createFailed: { message: 'Failed to create mfid', description: 'The mfid could not be created' },
};

export const useCreateMfid = () => {
  const { notifyLoading, notifySuccess, notifyError } = useToast()
  const queryClient = useQueryClient();
  const { mutateAsync: createMfid, isPending: isLoading } = useMutation({
    mutationKey: ['createMfid'] as const,
    mutationFn: Mfid.create,
    onMutate: () => notifyLoading(ToastMessages.creating),
    onSuccess: (newMfid, _v, id) => notifySuccess({
      id: id,
      message: ToastMessages.created.message,
      description: `The mfid (${newMfid}) has been created successfully.`
    }),
    onError: (_d, _v, id) => notifyError({ id, ...ToastMessages.createFailed }),
    onSettled: () => queryClient.invalidateQueries(mfidsQueryOptions()),
  })

  return { createMfid, isLoading };
}
