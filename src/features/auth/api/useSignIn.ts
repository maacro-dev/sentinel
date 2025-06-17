import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/app/supabase";
import { LoginFields } from "../schema/schema";
import { User } from "@/lib/types";

async function fetchUserWithRoles(username: string) {
  const { data: user, error } = await supabase.rpc("fetch_user_by_username", {
    arg: username,
  });

  if (error || !user) throw new Error(`User not found: ${error}`);
  return user;
}

async function signInUser(email: string, password: string) {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw new Error("Invalid credentials");
}

function mapUser(user: any): User {
  return {
    id: user.id,
    username: user.username,
    firstName: user.fname,
    lastName: user.lname,
    role: user.role,
  };
}

export const useSignIn = () => {
  return useMutation({
    mutationFn: async ({ username, password }: LoginFields): Promise<User> => {
      const user = await fetchUserWithRoles(username);
      await signInUser(user.email, password);
      return mapUser(user);
    },
  });
};
