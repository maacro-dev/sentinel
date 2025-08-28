import { parseUser, User } from "@/features/users/schemas/user";
import { useSessionStore } from "../store";
import { getSupabase } from "@/core/supabase/supabase";
import { Role } from "@/features/users";
import { redirect } from "@tanstack/react-router";
import { getRoleRedirect } from "@/features/users/utils";
import { isSessionExpired } from "../utils";
import { AUTH_TOKEN_KEY } from "../constants";
import { ErrorHandler } from "./Error";

export class Session {
  public static update(user: User) {
    this._state.setUser(user);
    this._state.setSignInTime(Date.now());
  }

  public static clear() {
    this._state.setUser(null);
    this._state.setSignInTime(null);
    this._forceClearStorage();
  }

  public static async restore() {
    if (this._state.user && this._state.signInTime) {
      if (isSessionExpired(this._state.signInTime)) {
        this.clear();
      } else {
        throw redirect({ to: getRoleRedirect(this._state.user.role) });
      }
    }

    const user = await this._fetchUser();
    if (user) {
      this.update(user)
      throw redirect({ to: getRoleRedirect(user.role) });
    }
    this.clear();
  }

  public static async ensure({ role: requiredRole }: { role: Role }) {
    if (this._state.user && this._state.signInTime) {
      if (isSessionExpired(this._state.signInTime)) {
        this.clear();
        throw redirect({ to: "/login" });
      }
      if (this._state.user.role !== requiredRole) {
        throw redirect({ to: "/unauthorized" });
      }
      return;
    }

    const user = await this._fetchUser();
    if (!user) {
      this.clear();
      throw redirect({ to: "/login" });
    }
    if (user.role !== requiredRole) {
      throw redirect({ to: "/unauthorized" });
    }
    this.update(user);
  }

  private static async _fetchUser(): Promise<User | null> {
    const supabase = await getSupabase();
    const { data, error } = await supabase.auth.getSession();

    if (error) {
      ErrorHandler.sessionError(error);
      return null;
    }

    if (!data.session) {
      ErrorHandler.sessionMissing();
      return null;
    }

    return parseUser(data.session.user);
  }

  static _forceClearStorage() {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    sessionStorage.clear();
  }

  private static get _state() {
    return useSessionStore.getState();
  }

  private constructor() { }
}
