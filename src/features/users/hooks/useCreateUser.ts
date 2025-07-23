import { useMutation, useQueryClient } from "@tanstack/react-query";
import { usersQueryOptions } from "../queries/options";
import { Users } from "../services/Users";
import { useToast } from "@/features/toast";
import { UserToasts } from "../toastMessages";

export const useCreateUser = () => {
  const { notifyLoading, notifySuccess, notifyError } = useToast()
  const queryClient = useQueryClient();
  const { mutateAsync: createUser, isPending: isLoading } = useMutation({
    mutationKey: ['createUser'] as const,
    mutationFn: Users.create,
    onMutate: () => notifyLoading(UserToasts.creating),
    onSuccess: (_d, _v, id) => notifySuccess({ id, ...UserToasts.created }),
    onError: (_d, _v, id) => notifyError({ id, ...UserToasts.createFailed }),
    onSettled: () => {
      queryClient.invalidateQueries(
        usersQueryOptions({ includeAdmin: false })
      );
    },
  })

  return { createUser, isLoading };
}
