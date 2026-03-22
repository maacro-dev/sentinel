import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Users } from '../services/Users';
import { useToast } from '@/features/toast';

export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  const { notifySuccess, notifyError } = useToast();

  return useMutation({
    mutationFn: (userId: string) => Users.deleteUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      notifySuccess({ message: 'User deleted successfully' });
    },
    onError: (error) => {
      notifyError({ message: error.message });
    },
  });
};
