import { supabase } from "@/app/supabase";
import { userSchema } from "@/lib/schemas/user";
import type { User, Result } from "@/lib/types";

export async function fetchUserWithRoles(username: string): Promise<Result<User>> {
  const { data: user, error: fetchError } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("username", username)
    .single();

  if (fetchError) {
    return {
      success: false,
      error: new Error("User not found. Please check your username and try again."),
    };
  }

  const parseResult = userSchema.safeParse(user);

  if (!parseResult.success) {
    return { success: false, error: new Error("Error parsing user data") };
  }

  return { success: true, data: parseResult.data };
}
