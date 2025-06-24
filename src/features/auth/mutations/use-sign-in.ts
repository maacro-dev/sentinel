import { useMutation } from "@tanstack/react-query";
import { fetchUserWithRoles, signInUser, updateLastActive } from "@/features/auth/api";

import type { Result, User, UserCredentials } from "@/lib/types";

export const useSignIn = () =>
  useMutation<User, Error, UserCredentials>({
    mutationFn: async ({ username, password }: UserCredentials) => {
      const res: Result<User> = await fetchUserWithRoles(username);
      if (!res.success) {
        throw res.error;
      }
      const user = res.data;

      const signInError = await signInUser(user.email, password);
      if (signInError) {
        throw new Error(signInError.message);
      }

      await updateLastActive(user.id);
      return user;
    },
  });
