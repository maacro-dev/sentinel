import { supabase } from "@/app/supabase";
import { usersSchema } from "@/lib/schemas/user";
import { validateResponse } from "@/utils";
import type { Result, User } from "@/lib/types";

export interface GetAllUsersParams {
  includeAdmin: boolean;
}

export async function getAllUsers({ includeAdmin }: GetAllUsersParams): Promise<Result<User[]>> {
  const query = supabase
    .from("user_details")
    .select("*");

  if (!includeAdmin) {
    query.neq("role", "admin");
  }

  const { data: users, error: usersError } = await query;

  return validateResponse({ 
    data: users, 
    schema: usersSchema, 
    error: usersError, 
    fallbackMsg: "Failed to load users",
  });
}
