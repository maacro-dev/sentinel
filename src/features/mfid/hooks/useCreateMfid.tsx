
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/features/toast";
import { mfidsQueryOptions } from "../queries/options";
import { Mfid } from "../services/Mfid";
import { MfidToasts } from "../toastMessages";

export const useCreateMfid = () => {
  const { notifyLoading, notifySuccess, notifyError } = useToast()
  const queryClient = useQueryClient();
  const { mutateAsync: createMfid, isPending: isLoading } = useMutation({
    mutationKey: ['createMfid'] as const,
    mutationFn: Mfid.create,
    onMutate: () => notifyLoading(MfidToasts.creating),
    onSuccess: (d, _v, id) => notifySuccess({ id, message: MfidToasts.created.message, description: d.message || MfidToasts.created.description }),
    onError: (_d, _v, id) => notifyError({ id, ...MfidToasts.createFailed }),
    onSettled: () => {
      queryClient.invalidateQueries(mfidsQueryOptions());
    },
  })

  return { createMfid, isLoading };
}
