import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Users } from '../services/Users';
import { useToast } from '@/features/toast';

export const useUpdateUser = () => {

  const queryClient = useQueryClient();
  const { notifySuccess, notifyError } = useToast();

  return useMutation({
    mutationFn: ({ userId, updates }: { userId: string; updates: Parameters<typeof Users.update>[1] }) => Users.update(userId, updates),
    onSuccess: (_user) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      notifySuccess({ message: "User updated", description: 'User updated successfully' });
    },
    onError: (error) => {
      notifyError({ message: error.message });
    },
  });
};
