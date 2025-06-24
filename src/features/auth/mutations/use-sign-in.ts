import { useMutation } from "@tanstack/react-query";
import { fetchUserWithRoles, signInUser, updateLastActive } from "@/features/auth/api";

import type { Result, User, UserCredentials } from "@/lib/types";

export const useSignIn = () => {
  return useMutation({
    mutationFn: async ({
      username,
      password,
    }: UserCredentials): Promise<Result<User>> => {
      const { data: user, error: fetchError } = await fetchUserWithRoles(username);
      if (fetchError || !user) {
        return { data: null, error: fetchError ?? new Error("User not found") };
      }

      const signInError = await signInUser(user.email, password);
      if (signInError) {
        return {
          data: null,
          error: new Error(signInError.message),
        };
      }

      await updateLastActive(user.id);

      return { data: user, error: null };
    },
  });
};
