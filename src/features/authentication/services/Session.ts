import { mapUser, User } from "@/features/users/schemas/user";
import { useSessionStore } from "../store";
import { getSupabase } from "@/core/supabase/supabase";
import { Role } from "@/features/users";
import { Auth } from "./Auth";
import { redirect } from "@tanstack/react-router";
import { getRoleRedirect } from "@/features/users/utils";
import { isSessionExpired } from "../utils";
import { AUTH_TOKEN_KEY } from "../constants";


export class Session {
  private constructor() {}

  private static get state() {
    return useSessionStore.getState();
  }
  public static async getClaims() {
    const supabase = await getSupabase();
    const { data, error } = await supabase.auth.getClaims();
    if (error) {
      throw error;
    }
    return data
  }

  public static update(user: User) {
    this.state.setUser(user);
    this.state.setSignInTime(Date.now());
  }

  public static clear() {
    this.state.setUser(null);
    this.state.setSignInTime(null);

    this._forceClearStorage();
  }

  public static async restore() {
    if (this.state.isInitialized && this.state.user) {
      throw redirect({ to: getRoleRedirect(this.state.user.role) });
    }

    const user = await this._fetchUser();
    if (user) {
      await this._commitFresh(user);
      throw redirect({ to: getRoleRedirect(user.role) });
    }
  }

  public static async ensure({ role: requiredRole }: { role: Role }) {
    if (this.state.isInitialized && this.state.user) return;

    const user = await this._fetchUser();

    if (!user) throw redirect({ to: "/login" });
    if (user.role !== requiredRole) throw redirect({ to: "/unauthorized" });

    await this._commitFresh(user);
  }

  private static async _fetchUser(): Promise<User | null> {
    const startTime = Date.now();

    const supabase = await getSupabase();
    const { data, error } = await supabase.auth.getSession();

    if (error || !data.session) {
      return null
    }

    console.log("User fetched in", Date.now() - startTime, "ms");
    return mapUser(data.session.user);
  }

  private static async _commitFresh(user: User) {
    if (isSessionExpired(this.state.signInTime)) {
      await Auth.signOut();
      throw redirect({ to: "/login" });
    }

    this.update(user);
    this.state.setIsInitialized(true);
  }

  private static _forceClearStorage() {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    sessionStorage.clear();
  }
}
