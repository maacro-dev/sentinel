import { SESSION_STORAGE } from "@/core/utils/zustand";
import { FormRouteType } from "@/routes/_manager/forms/-config";
import { create } from "zustand";
import { persist } from "zustand/middleware";

// could still cache multiple form type ids

interface TableState {
  ids: string[]
  currentIndex: number | null
  formType: FormRouteType | null | undefined
}

interface TableActions {
  setIds: (ids: string[], formType?: FormRouteType | null | undefined) => void;
  setCurrentIndex: (index: number | null) => void
  clear: () => void
}


export const useTableStore = create<TableState & TableActions>()(
  persist(
    (set) => ({
      ids: [],
      currentIndex: null,
      formType: null,
      setIds: (ids, formType) => set({ ids, formType }),
      setCurrentIndex: (i) => set({ currentIndex: i }),
      clear: () => set({ ids: [], currentIndex: null, formType: null }),
    }), {
    name: "sentinel.store.rows",
    storage: SESSION_STORAGE,
  }
  )
)
