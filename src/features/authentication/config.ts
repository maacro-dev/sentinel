import { createJSONStorage } from "zustand/middleware";

export const DEFAULT_IDLE_DURATION_MS = 8 * 60 * 60 * 1000; // 8 hours
export const TESTING_IDLE_DURATION_MS = 0.25 * 60 * 1000; // 15 seconds

export const MAX_IDLE_DURATION_MS = DEFAULT_IDLE_DURATION_MS;

export const SESSION_STORE_STORAGE = createJSONStorage(() => sessionStorage);
