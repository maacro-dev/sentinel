import { create } from "zustand";
import { persist } from "zustand/middleware";
import { SESSION_STORE_KEY } from "../constants";
import { User } from "@/features/users";
import { LOCAL_STORAGE } from "@/core/utils/zustand";

interface SessionState {
  user: User | null;
  signInTime: number | null;
}

interface SessionActions {
  setUser: (user: User | null) => void;
  setSignInTime: (time: number | null) => void;
  resetSession: () => void;
}

export const useSessionStore = create<SessionState & SessionActions>()(
  persist(
    (set) => ({
      user: null,
      signInTime: null,
      setUser: (user) => set({ user }),
      setSignInTime: (time) => set({ signInTime: time }),
      resetSession: () => set({ user: null, signInTime: null }),
    }),
    {
      name: SESSION_STORE_KEY,
      storage: LOCAL_STORAGE,
      partialize: ({ user, signInTime }) => ({ user, signInTime }),
    }
  )
);
