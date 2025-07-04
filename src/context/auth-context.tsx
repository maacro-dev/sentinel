import {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
  useCallback,
} from "react";
import { useLocalStorage } from "@/hooks";
import { supabaseSignIn, supabaseSignOut } from "@/api/auth";
import type { Result, Role, User, UserCredentials } from "@/lib/types";
import { getUserByEmail } from "@/api/users";

const AUTH_KEY = "humay.sentinel.auth";

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  role: Role | null;
  handleSignIn: (fields: UserCredentials) => Promise<Result<User>>;
  handleSignOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {

  const [storedUser, setStoredUser] = useLocalStorage<User | null>(AUTH_KEY, null);
  const [user, setUser] = useState<User | null>(storedUser);
  const isAuthenticated = !!user;

  useEffect(() => {
    setUser(storedUser);
  }, [storedUser]);

  const handleSignIn = useCallback(

    async ({ email, password }: UserCredentials): Promise<Result<User>> => {

      const signInError = await supabaseSignIn(email, password);

      if (signInError) {
        return { ok: false, error: signInError };
      }

      const userResult = await getUserByEmail(email);

      if (!userResult.ok) {
        return userResult
      }

      setUser(userResult.data);
      setStoredUser(userResult.data);

      return { ok: true, data: userResult.data };

    },
    [setStoredUser]
  );

  // should handle sign out error in the future wahahaha
  const handleSignOut = useCallback(async (): Promise<void> => {
    await supabaseSignOut();
    setUser(null);
    setStoredUser(null);
  }, [setStoredUser]);

  const role = user?.role ?? null;

  const value = useMemo(
    () => ({
      user,
      isAuthenticated,
      role,
      handleSignIn,
      handleSignOut,
    }),
    [user, isAuthenticated, role, handleSignIn, handleSignOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};