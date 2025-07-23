import { memo, useEffect, useRef } from "react";
import { LucideIcon, LoaderCircle, CircleCheck, OctagonAlert } from "lucide-react";
import { ToastType, ToastProps } from "../types";
import { useToastStore } from "../store";
import { expandFadeMotion, slideUpFadeMotion } from "@/core/utils/motions";
import { cn } from "@/core/utils/style";
import { Motion } from "@/core/components/Motion";

export const ToastIcon: Record<ToastType, LucideIcon> = {
  loading: LoaderCircle,
  success: CircleCheck,
  error: OctagonAlert,
}

export const Toast = memo(({ id, type, message, description, duration = 3000}: ToastProps) => {

  const dismiss = useToastStore((s) => s.dismiss);
  const Icon = ToastIcon[type];

  const timeoutRef = useRef<number>(0)
  useEffect(() => {
    if (type !== 'loading') {
      timeoutRef.current = window.setTimeout(() => dismiss(id), duration)
      return () => clearTimeout(timeoutRef.current)
    }
  }, [id, type, dismiss, duration])

  return (
    <Motion {...expandFadeMotion}>
      <Motion {...slideUpFadeMotion}
        className="min-h-[4.35rem] max-h-24 w-80 text-pretty bg-background
                  shadow border border-accent/60 rounded-lg p-4 flex-row
                  gap-3 items-center">
        <Icon className={cn("text-primary size-5", type === "loading" && "animate-spin")} />
        <div className="flex flex-col gap-1">
          <div className="font-semibold text-xs">{message}</div>
          {description && (
            <div className="text-muted-foreground text-[0.7rem]">
              {description}
            </div>
          )}
        </div>
      </Motion>
    </Motion>
  );
});
