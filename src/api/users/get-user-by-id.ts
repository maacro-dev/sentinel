import { supabase } from "@/app/supabase";
import { throwOnError, validateWithSchema } from "@/api/utils";
import type { User } from "@/lib/types";
import { userSchema } from "@/lib/schemas/user";

export async function getUserById(userId: string): Promise<User> {
  const { data, error } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  const rawUser = throwOnError(data, error, "User not found");
  return validateWithSchema(rawUser, userSchema, "Invalid user data");
}