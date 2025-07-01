import { useMutation } from "@tanstack/react-query";
import { fetchUserWithRoles, supabaseSignIn } from "@/features/auth/api";

import type { User, UserCredentials } from "@/lib/types";

export const useSignIn = () =>
  useMutation<User, Error, UserCredentials>({
    mutationFn: async ({ user_id, password }: UserCredentials) => {

      const user = await fetchUserWithRoles(user_id);
      const signInError = await supabaseSignIn(user.email, password);

      if (signInError) {
        throw new Error(signInError.message);
      }

      return user;
    },
  });
