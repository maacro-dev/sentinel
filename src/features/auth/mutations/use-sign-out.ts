import { useMutation } from "@tanstack/react-query";
import { signOutUser } from "@/features/auth/api";

export const useSignOut = () => {
  return useMutation({
    mutationFn: async () => {
      await signOutUser();
    }
  });
};
