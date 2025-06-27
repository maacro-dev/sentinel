import { supabase } from "@/app/supabase";
import { userSummarySchemaArray } from "@/lib/schemas/user";
import { Result, UserSummaryArray } from "@/lib/types";

export async function fetchAllUsers(): Promise<Result<UserSummaryArray>> {
  const { data: users, error: fetchError } = await supabase
    .from("user_summaries")
    .select("*");

  if (fetchError) {
    return {
      success: false,
      error: new Error("No users found."),
    };
  }

  const parseResult = userSummarySchemaArray.safeParse(users);

  if (!parseResult.success) {
    return { success: false, error: new Error("Error parsing user data") };
  }

  return { success: true, data: parseResult.data };
}
