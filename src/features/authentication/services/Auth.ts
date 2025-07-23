import { Credentials } from "../schemas";
import { getSupabase } from "@/core/supabase/supabase";
import { mapUser } from "@/features/users/schemas/user";
import { User } from "@/features/users";


export class Auth {
  private constructor() {}

  public static async signIn(credentials: Credentials): Promise<User> {
    const startTime = Date.now();
    const supabase = await getSupabase();
    const { data, error } = await supabase.auth.signInWithPassword(credentials);

    if (error) throw error;

    console.log("User signed in in", Date.now() - startTime, "ms");

    return mapUser(data.user);
  }

  public static async signOut(): Promise<void> {
    const startTime = Date.now();

    const supabase = await getSupabase();
    const { error } = await supabase.auth.signOut();

    if (error) {
      if (error.name === "AuthSessionMissingError") return;
      throw error;
    };

    console.log("User signed out in", Date.now() - startTime, "ms");
  }
}
