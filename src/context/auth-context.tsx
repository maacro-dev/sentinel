import {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
  useCallback,
} from "react";
import { useSignIn, useSignOut } from "@/features/auth/mutations";
import { useLocalStorage } from "@/hooks";
import { toError } from "@/lib/utils";

import type { Result, Role, User, UserCredentials } from "@/lib/types";

const AUTH_KEY = "humay.sentinel.auth";

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  role: Role | null;
  error: Error | null;
  handleLogin: (fields: UserCredentials) => Promise<Result<User>>;
  handleLogout: () => Promise<Result<void>>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [storedUser, setStoredUser] = useLocalStorage<User | null>(AUTH_KEY, null);

  const { mutateAsync: signIn, error: signInError } = useSignIn();
  const { mutateAsync: signOut, error: signOutError } = useSignOut();

  const error = signInError ?? signOutError ?? null;
  const isAuthenticated = Boolean(user);

  useEffect(() => {
    if (storedUser && storedUser.auth_id !== user?.auth_id) {
      setUser(storedUser);
    }
  }, [storedUser, user?.auth_id]);

  const handleLogin = useCallback(
    async (fields: UserCredentials): Promise<Result<User>> => {
      try {
        const user = await signIn(fields);

        setUser(user);
        setStoredUser(user);

        return { success: true, data: user };
      } catch (err) {
        return {
          success: false,
          error: toError(err),
        };
      }
    },
    [signIn, setUser, setStoredUser]
  );

  const handleLogout = useCallback(async (): Promise<Result<void>> => {
    try {
      await signOut();
      setUser(null);
      setStoredUser(null);
      return { success: true };
    } catch (err) {
      return { success: false, error: toError(err) };
    }
  }, [signOut, setStoredUser]);

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      isAuthenticated,
      role: user?.role ?? null,
      error,
      handleLogin,
      handleLogout,
    }),
    [user, isAuthenticated, error, handleLogin, handleLogout]
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
