import { ToastId, ToastOptions, ToastRecord } from '../types';
import { create } from 'zustand/react';

interface ToastState {
  id: number;
  toasts: ToastRecord[];
}

interface ToastActions {
  show: (toast: ToastOptions) => ToastId;
  dismiss: (id: number) => void;
}

export const useToastStore = create<ToastState & ToastActions>((set, get) => ({
  id: 0,
  toasts: [],

  show: (toast: ToastOptions) => {
    if (toast.id !== undefined) {
      set({
        toasts: get().toasts.map((t) =>
          t.id === toast.id ? { ...t, ...toast } : t
        ),
      });
      return toast.id
    }

    const { id: currentId, toasts } = get();
    const nextId = currentId;

    set({
      id: currentId + 1,
      toasts: [...toasts, { ...toast, id: nextId }],
    });

    return nextId;
  },

  dismiss: (id) => {
    set({
      toasts: get().toasts.filter(t => t.id !== id),
    });
  },
}));

