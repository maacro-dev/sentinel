import { getSupabase } from "@/app/supabase";
import { userSchema } from "@/lib/schemas/user";
import { validateResponse } from "@/utils";
import type { Result, User } from "@/lib/types";

export async function getUserByEmail(email: string): Promise<Result<User>> {

  const supabase = await getSupabase();

  const { data, error } = await supabase
    .from("user_details")
    .select("*")
    .eq("email", email)
    .maybeSingle();

  return validateResponse({
    data,
    schema: userSchema,
    error,
    fallbackMsg: "User not found",
  });
}
