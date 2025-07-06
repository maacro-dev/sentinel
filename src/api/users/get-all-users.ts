import { supabase } from "@/app/supabase";
import { usersSchema } from "@/lib/schemas/user";
import { validateResponse } from "@/utils";
import type { Result, User } from "@/lib/types";

export async function getAllUsers(): Promise<Result<User[]>> {
  const { data: users, error: usersError } = await supabase
    .from("user_details")
    .select("*");

  return validateResponse({ 
    data: users, 
    schema: usersSchema, 
    error: usersError, 
    fallbackMsg: "Failed to load users",
  });
}
