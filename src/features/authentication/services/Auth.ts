import { Credentials } from "../schemas";
import { getSupabase } from "@/core/supabase/supabase";
import { parseUser } from "@/features/users/schemas/user";
import { User } from "@/features/users";


export class Auth {
  private constructor() {}

  public static async signIn(credentials: Credentials): Promise<User> {
    console.log("Auth.signIn — starting sign in process...");
    const startTime = Date.now();
    const supabase = await getSupabase();
    const { data, error } = await supabase.auth.signInWithPassword(credentials);

    if (error) throw error;

    console.log("User signed in in", Date.now() - startTime, "ms");

    return parseUser(data.user);
  }

  public static async signOut(): Promise<void> {
    const startTime = Date.now();
    console.log("Auth.signOut — starting sign out process...");

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
