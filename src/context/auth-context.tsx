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

import type { Result, Role, User, UserCredentials } from "@/lib/types";

const AUTH_KEY = "humay.sentinel.auth";

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  role: Role | null;
  error: Error | null;
  handleLogin: (fields: UserCredentials) => Promise<Result<User>>;
  handleLogout: () => Promise<void>;
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
    if (storedUser && storedUser.id !== user?.id) {
      setUser(storedUser);
    }
  }, [storedUser, user?.id]);

  const handleLogin = useCallback(
    async (fields: UserCredentials) => {
      const { data, error } = await signIn(fields);
      if (error || !data) {
        return { data: null, error: error ?? new Error("User not found") };
      }

      setUser(data);
      setStoredUser(data);
      return { data, error: null };
    },
    [signIn, setStoredUser]
  );

  const handleLogout = useCallback(async () => {
    await signOut();
    setUser(null);
    setStoredUser(null);
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
