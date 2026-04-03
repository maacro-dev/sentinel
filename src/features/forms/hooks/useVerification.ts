import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Forms } from '../services/Forms';
import { useToast } from '@/features/toast';
import { useSessionStore } from '@/features/authentication/store/useSessionStore';

interface VerifyParams {
  id: number;
  status: 'approved' | 'rejected';
  remarks?: string | null;
}

export const VerificationToasts = {
  updating: { message: 'Updating verification', description: 'Please wait while the verification status is updated...' },
  approved: { message: 'Form approved', description: 'The form has been approved successfully.' },
  rejected: { message: 'Form rejected', description: 'The form has been rejected successfully.' },
  updateFailed: { message: 'Verification update failed', description: 'There was an error updating the verification status.' },
};

export function useVerification(formType: string, id: number, seasonId?: number) {
  const queryClient = useQueryClient();
  const { notifyLoading, notifySuccess, notifyError } = useToast();
  const user = useSessionStore((state) => state.user);

  return useMutation({
    mutationFn: ({ id, status, remarks }: VerifyParams) => {
      if (!user?.id) throw new Error('No authenticated user');
      return Forms.updateVerification(id, status, remarks, user.id);
    },
    onMutate: () => notifyLoading(VerificationToasts.updating),
    onSuccess: (_, variables, id) => {
      const toast = variables.status === 'approved' ? VerificationToasts.approved : VerificationToasts.rejected;
      notifySuccess({ id, ...toast });
    },
    onError: (_error, _variables, id) => notifyError({ id, ...VerificationToasts.updateFailed }),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['form-data-entry', formType, id, seasonId] as const, });
      queryClient.invalidateQueries({ queryKey: ['form-data', formType, seasonId] as const, });
      queryClient.invalidateQueries({ queryKey: ['dashboard-data', seasonId] as const, });
      queryClient.refetchQueries({ queryKey: ['collection-tasks'] });
    },
  });
}
