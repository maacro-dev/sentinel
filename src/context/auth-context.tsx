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
import { getUserById } from "@/api/users";
import type { Role, User, UserCredentials } from "@/lib/types";

const AUTH_KEY = "humay.sentinel.auth";

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  role: Role | null;
  handleSignIn: (fields: UserCredentials) => Promise<User>;
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

    async ({ user_id, password }: UserCredentials): Promise<User> => {

      const user = await getUserById(user_id);
      const signInError = await supabaseSignIn(user.email, password);

      if (signInError) {
        throw new Error(signInError.message);
      }

      setUser(user);
      setStoredUser(user);
      return user;

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