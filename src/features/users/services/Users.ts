import { getSupabase } from "@/core/supabase/supabase";
import { UserFormInput } from "../schemas";
import { parseUserArray } from "../schemas/user";

export class Users {
  private constructor() { }

  static async getAll({ includeAdmin }: { includeAdmin: boolean }) {
    const supabase = await getSupabase();
    const query = supabase
      .from("user_details")
      .select("*")
      .order("role")
      .order("created_at", { ascending: false });

    if (!includeAdmin) {
      query.neq("role", "admin");
    }

    const { data: users, error } = await query;
    if (error) {
      throw error;
    }
    return parseUserArray(users)
  }

  static async create(form: UserFormInput) {
    const supabase = await getSupabase();
    const { data, error } = await supabase.functions.invoke("create-user", {
      body: form,
    });

    if (error) {
      throw error
    }

    return data;
  }

  public static async update(userId: string, updates: {
    first_name?: string;
    last_name?: string;
    email?: string;
    role?: string;
    password?: string;
    is_active?: boolean;
  }) {
    const supabase = await getSupabase();
    const { data, error } = await supabase.functions.invoke("update-user", {
      body: { user_id: userId, ...updates },
    });
    if (error) throw error;
    return data;
  }

  public static async deleteUser(userId: string) {
    const supabase = await getSupabase();
    const { data, error } = await supabase.functions.invoke("delete-user", {
      body: { user_id: userId },
    });
    if (error) throw error;
    return data;
  }

  public static async sendPasswordResetEmail(email: string, redirectTo?: string): Promise<void> {
    const supabase = await getSupabase();
    const { error } = await supabase.functions.invoke("send-password-reset", {
      body: { email, redirect_to: redirectTo },
    });
    if (error) throw error;
  }
}


