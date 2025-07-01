import { supabase } from "@/app/supabase";
import { User } from "@/lib/types";

export async function fetchAllUsers(): Promise<User[]> {
  const { data: users, error: fetchError } = await supabase
    .from("user_profiles")
    .select("*");

  if (fetchError) {
    throw new Error("No users found.");
  }

  return users;
}
