import { supabase } from "@/app/supabase";
import { userSchema } from "@/lib/schemas/user";
import type { User, Result } from "@/lib/types";

export async function fetchUserWithRoles(username: string): Promise<Result<User>> {
  const { data: user, error: fetchError } = await supabase.rpc("fetch_user_by_username", {
    arg: username,
  });

  if (fetchError) {
    return { data: null, error: new Error("User not found") };
  }

  const { success, data: parsedUser } = userSchema.safeParse(user);

  if (!success) {
    return { data: null, error: new Error("Error parsing user data") };
  }

  return { data: parsedUser, error: null };
}
