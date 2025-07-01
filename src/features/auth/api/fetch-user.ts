import { supabase } from "@/app/supabase";
import type { User } from "@/lib/types";

export async function fetchUserWithRoles(userId: string): Promise<User> {
  const { data: user, error: fetchError } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (fetchError) {
    throw new Error("User not found. Please check your username and try again.");
  }

  return user;
}
