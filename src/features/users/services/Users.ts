import { getSupabase } from "@/core/supabase/supabase";
import { userArraySchema, UserFormInput } from "../schemas";

export class Users {
  private constructor() {}

  static async getAll({ includeAdmin }: { includeAdmin: boolean }) {
    const supabase = await getSupabase();
    const query = supabase
      .from("user_details")
      .select("*")
      .order("created_at", { ascending: true });

    if (!includeAdmin) {
      query.neq("role", "admin");
    }

    const { data: users, error } = await query;
    if (error) {
      throw error;
    }
    return userArraySchema.parse(users);
  }

  static async create(form: UserFormInput) {
    const supabase = await getSupabase();
    const { data, error } = await supabase.functions.invoke("create-user", {
      body: form,
    });

    if (error) {
      throw error;
    }
    return data;
  }
}
