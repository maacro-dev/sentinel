import { memo } from "react";
import { AnimatePresence } from "motion/react";
import { Toast } from "./Toast";
import { useToastStore } from "../store";

export const Toaster = memo(() => {

  const toasts = useToastStore(s => s.toasts);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-4" aria-live="polite">
      <AnimatePresence initial={false}>
        { toasts.map((toast) => (
          <Toast key={toast.id} { ...toast }/>
        ))}
      </AnimatePresence>
    </div>
  )
})

