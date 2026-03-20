import { create } from 'zustand';

interface ImportNotificationState {
  newlyImportedSeasonId: number | null;
  setNewlyImportedSeasonId: (id: number | null) => void;
}

export const useImportNotificationStore = create<ImportNotificationState>((set) => ({
  newlyImportedSeasonId: null,
  setNewlyImportedSeasonId: (id) => set({ newlyImportedSeasonId: id }),
}));
