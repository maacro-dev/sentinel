import { create } from 'zustand';

interface ImportNotificationState {
  importedSeasonId: number | null;
  importedFormType: string | null;
  showSeasonDot: boolean;
  setImported: (seasonId: number | null, formType: string | null) => void;
  clearFormType: () => void;
  clearSeasonDot: () => void;
}

export const useImportNotificationStore = create<ImportNotificationState>((set) => ({
  importedSeasonId: null,
  importedFormType: null,
  showSeasonDot: false,
  setImported: (seasonId, formType) =>
    set({
      importedSeasonId: seasonId,
      importedFormType: formType,
      showSeasonDot: true,
    }),
  clearFormType: () => set({ importedFormType: null }),
  clearSeasonDot: () => set({ showSeasonDot: false }),
}));
