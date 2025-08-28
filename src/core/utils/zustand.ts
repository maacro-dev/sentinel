import { createJSONStorage } from "zustand/middleware";

export const SESSION_STORAGE = createJSONStorage(() => sessionStorage);
export const LOCAL_STORAGE = createJSONStorage(() => localStorage);
