import { memo, ReactNode } from "react";
import { CircleCheck, LoaderCircle, OctagonAlert } from "lucide-react";
import { toast } from "sonner";

export interface ToastOptions {
  type: "loading" | "success" | "error";
  message: string;
  description?: string;
  toastId?: ReturnType<typeof toast.loading>;
}

const ICONS: Record<ToastOptions["type"], ReactNode> = {
  loading: <LoaderCircle  className="h-5 w-5 animate-spin text-primary" />,
  success: <CircleCheck   className="h-5 w-5 text-primary" />,
  error:   <OctagonAlert  className="h-5 w-5 text-primary" />,
};

const TOAST_FN: Record<ToastOptions["type"], typeof toast.loading> = {
  loading: toast.loading,
  success: toast.success,
  error:   toast.error,
};

interface ToastContentProps {
  icon: React.ReactNode;
  message: string;
  description?: string;
}
const ToastContent = 
  memo<ToastContentProps>(({ icon, message, description }) => (
    <div className="w-full max-w-md px-1 py-0.5">
      <div className="flex items-center gap-3">
        <div className="inline-flex">{icon}</div>
        <div className="flex flex-col gap-[0.1rem]">
          <h3 className="font-semibold text-xs">{message}</h3>
          {description && (
            <p className="text-muted-foreground/75">{description}</p>
          )}
        </div>
      </div>
    </div>
  )
);

export const showToast = ({
  type,
  message,
  description,
  toastId,
}: ToastOptions): ReturnType<typeof toast.loading> => {
  const icon    = ICONS[type];
  const toastFn = TOAST_FN[type];
  const content = <ToastContent icon={icon} message={message} description={description} />;
  
  return toastFn(content, { id: toastId, icon: null });
};
