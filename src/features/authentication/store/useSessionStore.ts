import { create } from "zustand";
import { persist } from "zustand/middleware";
import { SESSION_STORE_KEY } from "../constants";
import { SESSION_STORE_STORAGE } from "../config";
import { User } from "@/features/users";

interface SessionState {
  isInitialized: boolean;
  user: User | null;
  signInTime: number | null;
}

interface SessionActions {
  setIsInitialized: (value: boolean) => void;
  setUser: (user: User | null) => void;
  setSignInTime: (time: number | null) => void;
  resetSession: () => void;
}

export const useSessionStore = create<SessionState & SessionActions>()(
  persist(
    (set) => ({
      isInitialized: false,
      user: null,
      signInTime: null,
      setIsInitialized: (value) => set({ isInitialized: value }),
      setUser: (user) => set({ user }),
      setSignInTime: (time) => set({ signInTime: time }),
      resetSession: () => set({ isInitialized: false, user: null, signInTime: null }),
    }),{
      name: SESSION_STORE_KEY,
      storage: SESSION_STORE_STORAGE,
      partialize: ({ isInitialized, user, signInTime }) => ({ isInitialized, user, signInTime }),
    }
  )
);
