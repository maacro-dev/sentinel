import { useMutation } from "@tanstack/react-query";
import { Auth } from "../services/Auth";
import { useSession } from "./useSession";
import { useToast } from "@/features/toast";
import { AuthToasts } from "../toastMessages";
import { User } from "@/features/users";
import { Awaitable } from "@/core/lib/types";
import { useRouter } from "@tanstack/react-router";
import { getRoleRedirect } from "@/features/users/utils";

interface SignInOptions {
  onSignIn: (user: User) => Awaitable<void>
}

export const useSignIn = ({ onSignIn }: SignInOptions) => {
  const router = useRouter();
  const { notifySuccess, notifyError } = useToast()
  const { updateSession } = useSession();
  const { mutateAsync: signIn, isPending: isLoading } = useMutation({
    mutationKey: ['signIn'] as const,
    mutationFn: Auth.signIn,
    onSuccess: async (user) => {
      updateSession(user)
      notifySuccess(AuthToasts.signedIn)

      await router.preloadRoute({ to: getRoleRedirect(user.role) })
      await onSignIn(user)
    },
    onError: () => notifyError(AuthToasts.signInFailed)
  })
  return { signIn, isLoading };
};
