import { useCallback, useMemo } from "react";
import { useToastStore } from "../store";
import { ToastId, ToastOptions, ToastType } from "../types";

export const useToast = () => {
  const show = useToastStore((s) => s.show);
  const toast = useCallback(
    (type: ToastType, opts: Omit<ToastOptions, "type">): ToastId =>
      show({ type, ...opts }),
    [show]
  );

  const { notifySuccess, notifyError, notifyLoading } = useMemo(
    () => ({
      notifySuccess: (opts: Omit<ToastOptions, "type">) => toast("success", opts),
      notifyError:   (opts: Omit<ToastOptions, "type">) => toast("error",   opts),
      notifyLoading: (opts: Omit<ToastOptions, "type">) => toast("loading", opts),
    }),
    [toast]
  );

  return { notifySuccess, notifyError, notifyLoading };
};
