import { create } from "zustand";
import { Result, User, UserCredentials } from "@/lib/types";
import { getCurrentSession, supabaseSignIn, supabaseSignOut } from "@/api/auth";
import { getUserByEmail } from "@/api/users";
import { logDebugCheck, logDebugError, logDebugOk } from "chronicle-log";

const MAX_SESSION_AGE_MS = 0.5 * 60 * 1000; // 0.5 minutes for testing
const SIGN_IN_TIME_KEY = "sentinel.sign_in_time";

/**
 * Implementing my own timebox for session expiration.
 * Supabase timebox is only on PRO plan :<
 */
const checkSession = async (): Promise<{ user: User | null; isValid: boolean }> => {
  logDebugCheck("Checking if session exists");
  const sessionResult = await getCurrentSession();

  if (!sessionResult.ok) {
    logDebugError("Session does not exist");
    localStorage.removeItem(SIGN_IN_TIME_KEY);
    return { user: null, isValid: false };
  }

  logDebugOk("Session exists");

  logDebugCheck("Checking if session is fresh");
  const now = Date.now();

  const stored = localStorage.getItem(SIGN_IN_TIME_KEY);
  let lastSignInTimeMs = stored ? parseInt(stored, 10) : NaN;

  if (isNaN(lastSignInTimeMs)) {
    logDebugOk("First time seeing session → storing sign‑in time");
    lastSignInTimeMs = now;
    localStorage.setItem(SIGN_IN_TIME_KEY, now.toString());
  }

  const age = now - lastSignInTimeMs;
  if (age > MAX_SESSION_AGE_MS) {
    logDebugError("Session expired");
    localStorage.removeItem(SIGN_IN_TIME_KEY);
    return { user: null, isValid: false };
  }

  logDebugOk("Session is fresh — fetching user profile");
  const { email } = sessionResult.data.user;
  const userResult = await getUserByEmail(email!);

  if (userResult.ok) {
    logDebugOk(`Authenticated as ${email}`);
    return { user: userResult.data, isValid: true };
  } else {
    logDebugError("User record lookup failed → clearing auth");
    localStorage.removeItem(SIGN_IN_TIME_KEY);
    return { user: null, isValid: false };
  }
};


interface AuthState {
  user: User | null;
  hasValidSession: boolean;
  sessionChecked: boolean;
}

interface AuthActions {
  setUser: (user: User | null) => void;
  setHasValidSession: (hasValidSession: boolean) => void;
  checkSession: () => Promise<void>; 
  handleSignIn: (fields: UserCredentials) => Promise<Result<User>>;
  handleSignOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState & AuthActions>((set) => ({
  user: null,
  hasValidSession: false,
  sessionChecked: false,
  setUser: (user: User | null) => set({ user }),
  setHasValidSession: (hasValidSession: boolean) => set({ hasValidSession }),
  checkSession: async () => {
    const { user, isValid } = await checkSession();
    set({ user, hasValidSession: isValid, sessionChecked: true });
  },
  handleSignOut: async (): Promise<void> => {
    await supabaseSignOut();
    set({ user: null });
    localStorage.removeItem(SIGN_IN_TIME_KEY);
  },
  handleSignIn: async ({ email, password }: UserCredentials): Promise<Result<User>> => {
    const signInResult = await supabaseSignIn(email, password);
    if (!signInResult.ok) return signInResult;

    const userResult = await getUserByEmail(signInResult.data.user.email);
    if (userResult.ok) {
      set({ user: userResult.data });
      localStorage.setItem(SIGN_IN_TIME_KEY, Date.now().toString());
    }
    return userResult;
  },
}));