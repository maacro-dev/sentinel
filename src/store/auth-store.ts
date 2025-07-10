import { create } from "zustand";
import { Result, User, UserCredentials } from "@/lib/types";
import { supabaseSession, supabaseSignIn, supabaseSignOut } from "@/api/auth";
import { getUserByEmail } from "@/api/users";
import { clearSignInTime, storeSignInTime } from "@/utils";

interface AuthState {
  user: User | null;
  sessionChecked: boolean;
}

interface AuthActions {
  setUser: (user: User | null) => void;
  handleSession: () => Promise<void>; 
  handleSignIn: (fields: UserCredentials) => Promise<Result<User>>;
  handleSignOut: () => Promise<Result<void>>;
}

export const useAuthStore = create<AuthState & AuthActions>((set) => ({
  user: null,
  sessionChecked: false,
  setUser: (user: User | null) => set({ user }),
  handleSession: async () => {
    const sessionResult = await supabaseSession();
    if (sessionResult.ok) {
      set({ user: sessionResult.data,  sessionChecked: true });
    } else {
      set({ user: null,  sessionChecked: true });
    }
  },
  handleSignOut: async (): Promise<Result<void>> => {
    const signOutResult = await supabaseSignOut();
    if (!signOutResult.ok) { return signOutResult; }

    clearSignInTime();
    set({ user: null, sessionChecked: false });
    return { ok: true, data: undefined };
  },
  handleSignIn: async ({ email, password }: UserCredentials): Promise<Result<User>> => {
    const signInResult = await supabaseSignIn(email, password);
    if (!signInResult.ok) { return signInResult; }

    const userResult = await getUserByEmail(signInResult.data.user.email);
    if (userResult.ok) {
      set({ user: userResult.data });
      storeSignInTime(Date.now());
    }

    return userResult;
  },
}));