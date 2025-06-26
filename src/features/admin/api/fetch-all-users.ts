import { supabase } from "@/app/supabase";
import { userSchemaArray } from "@/lib/schemas/user";
import type { User, Result } from "@/lib/types";

export async function fetchAllUsers(): Promise<Result<User[]>> {
  const { data: users, error: fetchError } = await supabase
    .from("user_profiles")
    .select("*");

  if (fetchError) {
    return {
      success: false,
      error: new Error("No users found."),
    };
  }

  const parseResult = userSchemaArray.safeParse(users);

  if (!parseResult.success) {
    return { success: false, error: new Error("Error parsing user data") };
  }

  return { success: true, data: parseResult.data };
}
