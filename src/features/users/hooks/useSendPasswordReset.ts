import { useMutation } from '@tanstack/react-query';
import { Users } from '../services/Users';
import { useToast } from '@/features/toast';

export const useSendPasswordResetEmail = () => {
  const { notifySuccess, notifyError, notifyLoading } = useToast();

  return useMutation({
    mutationFn: ({ email, redirectTo }: { email: string; redirectTo?: string }) => Users.sendPasswordResetEmail(email, redirectTo),
    onMutate: () => notifyLoading({ message: "Sending email...", description: "Trying to send password reset email" }),
    onSuccess: (_d, v, id) => {
      notifySuccess({ id, message: "Sent successfully", description: `Password reset email sent to ${v.email}` });
    },
    onError: (err, _v, id) => {
      notifyError({ id, message: err.message });
    },
  });
};
