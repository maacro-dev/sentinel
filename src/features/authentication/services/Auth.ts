import { Credentials } from "../schemas";
import { getSupabase } from "@/core/supabase/supabase";
import { parseUser } from "@/features/users/schemas/user";

import { User } from "@/features/users";


export class Auth {
  private constructor() { }

  public static async signIn(credentials: Credentials): Promise<User> {
    const supabase = await getSupabase();
    const { data, error } = await supabase.auth.signInWithPassword(credentials);

    if (error) {
      console.error("Error signing in — ", error)
      throw error
    };

    const user = parseUser(data.user);

    if (!user.is_active) {
      throw new Error("Account is deactivated.")
    }

    return user;
  }

  public static async signOut(): Promise<void> {
    const startTime = Date.now();

    const supabase = await getSupabase();
    const { error } = await supabase.auth.signOut();

    if (error) {
      if (error.name === "AuthSessionMissingError") return;
      if (error.message.includes("Session from session_id claim in JWT does not exist")) return;
      throw error;
    };

    console.log("User signed out in", Date.now() - startTime, "ms");
  }
}
