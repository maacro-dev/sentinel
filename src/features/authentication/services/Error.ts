import { AuthError } from "@supabase/supabase-js";

export class ErrorHandler {

  public static sessionError(error: AuthError)  {
    if (!error) {
      console.warn("Session error is null, no action taken");
    }
  }

  public static sessionMissing() {
    console.warn("Session is missing, redirecting to login");
  }

  private constructor() {}
}
