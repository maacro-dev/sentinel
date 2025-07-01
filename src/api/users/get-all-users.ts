import { supabase } from "@/app/supabase";
import { throwOnError, validateWithSchema } from "../utils";
import type { User } from "@/lib/types";
import { usersSchema } from "@/lib/schemas/user";

export async function getAllUsers(): Promise<User[]> {
  const { data, error } = await supabase
    .from("user_profiles")
    .select("*");

  console.log(data, error);
  const rawData = throwOnError(data, error, "Failed to load users");
  return validateWithSchema(rawData, usersSchema, "Invalid user data");
}
