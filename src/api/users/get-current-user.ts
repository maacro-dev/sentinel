import { supabase } from "@/app/supabase";
import { userSchema } from "@/lib/schemas/user";
import { validateResponse } from "@/utils";
import type { Result, User } from "@/lib/types";

export async function getCurrentUser(): Promise<Result<User>> {
  const { data, error } = await supabase
    .from("user_details")
    .select("*")
    .maybeSingle()
  
  return validateResponse({ 
    data, 
    schema: userSchema, 
    error, 
    fallbackMsg: "User not found",
  });
}