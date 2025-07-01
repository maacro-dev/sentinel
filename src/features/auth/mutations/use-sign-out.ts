import { useMutation } from "@tanstack/react-query";
import { supabaseSignOut } from "@/features/auth/api";

export const useSignOut = () => {
  return useMutation({
    mutationFn: async () => {
      await supabaseSignOut();
    }
  });
};
