import { usersSchema } from "@/lib/schemas/user";
import { validateResponse } from "@/utils";
import type { Result, User } from "@/lib/types";
import { getSupabase } from "@/app/supabase";

export interface GetAllUsersParams {
  includeAdmin: boolean;
}

export async function getAllUsers({ includeAdmin }: GetAllUsersParams): Promise<Result<User[]>> {

  const supabase = await getSupabase();
  const query = supabase
    .from("user_details")
    .select("*")
    .order("created_at", { ascending: true });

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
