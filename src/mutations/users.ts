import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createUser } from "@/api/users";
import { UserCreate } from "@/lib/types";
import { usersQueryOptions } from "@/queries";
import { showToast } from "@/app/toast";

export function createUserMutation() {
  const queryClient = useQueryClient();

return useMutation({
  mutationFn: async (user: UserCreate) => createUser(user),
  onMutate: async () => {
    const id = showToast({
      type: "loading",
      message: "Creating user",
      description: "Please wait while we create the user",
    })
    return { toastId: id };
  },
  onError: (_error, _variables, context) => {
    if (context) {
      showToast({
        type: "error",
        message: "Error",
        description: "Please try again",
        toastId: context.toastId,
      })
    }
  },
  onSuccess: (_data, _variables, context) => {
    if (context) {
      showToast({
        type: "success",
        message: "Success",
        description: "User created successfully",
        toastId: context.toastId,
      })
    }
  },
  onSettled: () => {
    queryClient.invalidateQueries(
      usersQueryOptions({ includeAdmin: false })
    );
  },
});

}

