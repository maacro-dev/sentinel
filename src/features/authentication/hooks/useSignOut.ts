import { useMutation } from "@tanstack/react-query";
import { Auth } from "../services/Auth";
import { useSession } from "./useSession";
import { useToast } from "@/features/toast";
import { AuthToasts } from "../toastMessages";
import { Awaitable } from "@/core/lib/types";

interface SignOutOptions {
  onSignOut?: () => Awaitable<void>
}

export const useSignOut = ({ onSignOut }: SignOutOptions = {}) => {
  const { notifySuccess, notifyError } = useToast()
  const { clearSession } = useSession();
  const { mutateAsync: signOut, isPending: isLoading } = useMutation({
    mutationKey: ['signOut'] as const,
    mutationFn: Auth.signOut,
    onSuccess: async () => {
      clearSession()
      notifySuccess(AuthToasts.signedOut)
      await onSignOut?.()
    },
    onError: () => {
      notifyError(AuthToasts.signOutFailed)
    }
  })

  return { signOut, isLoading };
};
