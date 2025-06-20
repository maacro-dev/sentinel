import { useMutation } from "@tanstack/react-query";
import { UserCredentials } from "@/features/auth/schema/schema";
import { User } from "@/lib/types";
import { fetchUserWithRoles, signInUser } from "@/features/auth/api";
import { Result } from "@/lib/types";

export const useSignIn = () => {
  return useMutation({
    mutationFn: async ({
      username,
      password
    }: UserCredentials): Promise<Result<User>> => {
      const { data: user, error: fetchError } = await fetchUserWithRoles(username);
      if (fetchError || !user) {
        return { data: null, error: fetchError ?? new Error("User not found") };
      }

      const signInError = await signInUser(user.email, password);
      if (signInError) {
        return { data: null, error: signInError };
      }

      return { data: user, error: null };
    }
  });
};
