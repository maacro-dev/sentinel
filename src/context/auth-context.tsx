import {
  createContext,
  useContext,
  useEffect,
  useState,
  useMemo,
  useCallback,
} from "react";
import { useLocalStorage } from "@/hooks";

import type { Role, User, UserCredentials } from "@/lib/types";
import { fetchUserWithRoles, supabaseSignIn, supabaseSignOut } from "@/features/auth/api";

const AUTH_KEY = "humay.sentinel.auth";

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  role: Role | null;
  handleLogin: (fields: UserCredentials) => Promise<User>;
  handleLogout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [storedUser, setStoredUser] = useLocalStorage<User | null>(AUTH_KEY, null);
  const isAuthenticated = user ? true : false;

  useEffect(() => {
    if (storedUser && storedUser.auth_id !== user?.auth_id) {
      setUser(storedUser);
    }
  }, [storedUser, user?.auth_id]);

  const handleLogin = useCallback(
    async ({ user_id, password }: UserCredentials): Promise<User> => {

      try {
        const user = await fetchUserWithRoles(user_id);
        const signInError = await supabaseSignIn(user.email, password);

        if (signInError) {

          throw new Error(signInError.message);
        }

        setUser(user);
        setStoredUser(user);

        return user;
      } catch (err) {
        throw err;
      }
    },
    [setUser, setStoredUser]
  );

  const handleLogout = useCallback(async (): Promise<void> => {
    await supabaseSignOut();
    setUser(null);
    setStoredUser(null);
  }, [setStoredUser]);

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      isAuthenticated,
      role: user?.role ? user.role : null,
      handleLogin,
      handleLogout,
    }),
    [user, isAuthenticated, handleLogin, handleLogout]
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
