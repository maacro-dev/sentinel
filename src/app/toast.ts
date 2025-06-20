import { toast } from "sonner";

export const TOAST_DURATION = 3000; // 3s
export const TOAST_POSITION = "top-center" as const;

export const ToastConfig = {
  duration: TOAST_DURATION,
  position: TOAST_POSITION
};

export const showErrorToast = (message: string, description?: string) => {
  toast.error(message, {
    description,
    duration: TOAST_DURATION,
    position: TOAST_POSITION
  });
};

export const showSuccessToast = (message: string, description?: string) => {
  toast.success(message, {
    description,
    duration: TOAST_DURATION,
    position: TOAST_POSITION
  });
};
