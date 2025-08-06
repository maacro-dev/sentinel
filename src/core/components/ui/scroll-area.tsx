import * as React from "react"
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area"
import { cn } from "@/core/utils/style"

type ScrollAreaContextType = {
  viewportRef: React.RefObject<HTMLDivElement | null>
  resetScroll: () => void
  saveScroll: () => void
  restoreScroll: () => void
}

const ScrollAreaContext = React.createContext<ScrollAreaContextType | null>(null)

export function useScrollArea() {
  const context = React.useContext(ScrollAreaContext)
  if (!context) {
    throw new Error("useScrollArea must be used within a ScrollAreaProvider")
  }
  return context
}

export function ScrollAreaProvider({ children }: React.PropsWithChildren<{}>) {
  const viewportRef = React.useRef<HTMLDivElement>(null)
  const savedPosition = React.useRef(0)

  const resetScroll = React.useCallback(() => {
    viewportRef.current?.scrollTo({ top: 0, behavior: "auto" })
  }, [])

  const saveScroll = React.useCallback(() => {
    if (viewportRef.current) {
      savedPosition.current = viewportRef.current.scrollTop
    }
  }, [])

  const restoreScroll = React.useCallback(() => {
    if (viewportRef.current) {
      viewportRef.current.scrollTo({ top: savedPosition.current, behavior: "smooth" })
    }
  }, [])

  return (
    <ScrollAreaContext.Provider
      value={{ viewportRef, resetScroll, saveScroll, restoreScroll }}
    >
      {children}
    </ScrollAreaContext.Provider>
  )
}

interface ScrollAreaProps extends React.ComponentProps<typeof ScrollAreaPrimitive.Root> {
  className?: string
  enableHorizontalScroll?: boolean
  children: React.ReactNode
}

export function ScrollArea({
  className,
  children,
  enableHorizontalScroll = false,
  ...props
}: ScrollAreaProps) {
  const { viewportRef } = useScrollArea()

  return (
    <ScrollAreaPrimitive.Root
      data-slot="scroll-area"
      className={cn("relative", className)}
      {...props}
    >
      <ScrollAreaPrimitive.Viewport
        ref={viewportRef}
        data-slot="scroll-area-viewport"
        className="focus-visible:ring-ring/50 size-full rounded-[inherit] transition-[color,box-shadow] outline-none focus-visible:ring-[3px] focus-visible:outline-1"
      >
        {children}
      </ScrollAreaPrimitive.Viewport>
      <ScrollBar />
      <ScrollAreaPrimitive.Corner />
    </ScrollAreaPrimitive.Root>
  )
}

function ScrollBar({
  className,
  orientation = "vertical",
  ...props
}: React.ComponentProps<typeof ScrollAreaPrimitive.ScrollAreaScrollbar>) {
  return (
    <ScrollAreaPrimitive.ScrollAreaScrollbar
      data-slot="scroll-area-scrollbar"
      orientation={orientation}
      className={cn(
        "flex touch-none p-px transition-all ease-in-out select-none",
        orientation === "vertical" &&
          "h-full w-[0.3rem] hover:w-[0.45rem] border-l border-l-transparent",
        orientation === "horizontal" &&
          "h-[0.3rem] hover:h-[0.45rem] flex-col border-t border-t-transparent",
        className
      )}
      {...props}
    >
      <ScrollAreaPrimitive.ScrollAreaThumb
        data-slot="scroll-area-thumb"
        className="bg-muted-foreground/45 relative flex-1 rounded-full"
      />
    </ScrollAreaPrimitive.ScrollAreaScrollbar>
  )
}


export { ScrollBar }
