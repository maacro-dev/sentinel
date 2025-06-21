import { toast } from "sonner";
import { isMobile } from "@/lib/utils";

export const showErrorToast = (message: string, description?: string) => {

  toast.error(message, {
    description,
    duration: 3000,
    position: isMobile ? "bottom-center" : "top-center"
  });
};

export const showSuccessToast = (message: string, description?: string) => {
  toast.success(message, {
    description,
    duration: 3000,
    position: isMobile ? "bottom-center" : "top-center"
  });
};
