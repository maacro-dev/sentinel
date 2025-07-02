import { supabase } from "@/app/supabase";
import { throwOnError, validateWithSchema } from "@/api/utils";
import { userIdSchema } from "@/lib/schemas/user";

export async function getNextUserId(): Promise<string> {
  const { data, error } = await supabase.rpc("next_user_id")

  const rawData = throwOnError(data, error, "Failed to generate user id");
  return validateWithSchema(rawData, userIdSchema, "Invalid user data");
}

