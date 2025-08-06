import { ComponentProps, memo } from "react";
import { cn } from "../utils/style";

interface TableHeaderHandleProps extends ComponentProps<'div'> {
  isResizing?: boolean;
}

export const TableHeaderHandle = memo(({ className, isResizing, ...props }: TableHeaderHandleProps) => {
  return <div
    className={cn(
      "absolute right-0 top-1/2 h-1/2 -translate-y-1/2 w-[4px]",
      "cursor-col-resize select-none touch-none",
      "bg-muted-foreground/10 transition-all",
      "hover:bg-muted-foreground/30 hover:w-[6px]",
      isResizing ? "bg-muted-foreground/50 w-[6px]" : "",
      className
    )}
    {...props}
  />
})
