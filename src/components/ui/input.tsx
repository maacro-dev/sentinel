import * as React from "react";
import { cn } from "@/lib/utils";

interface InputProps extends React.ComponentProps<"input"> {
  renderPrefix?: (focused: boolean) => React.ReactNode;
  renderSuffix?: (focused: boolean) => React.ReactNode;
}

function Input({ className, type, renderPrefix, renderSuffix, ...props }: InputProps) {
  const [focused, setFocused] = React.useState(false);

  return (
    <div
      className={cn(
        "relative flex items-center gap-2",
        "border-input flex w-full min-w-0 rounded-md border px-2 py-2",
        "ring-0 ring-transparent ring-offset-2 ring-offset-background",
        "transition-all focus-within:ring-2 focus-within:ring-ring",
        className
      )}
    >

      {renderPrefix?.(focused)}

      <input
        type={type}
        data-slot="input"
        onFocus={(e) => {
          setFocused(true);
          props.onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          props.onBlur?.(e);
        }}
        className={cn(
          "w-full file:text-foreground placeholder:text-muted-foreground/50 selection:bg-primary selection:text-primary-foreground dark:bg-input/30 bg-transparent text-base file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          "focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0",
          className
        )}
        {...props}
      />

      {renderSuffix?.(focused)}
    </div>
  );
}

export { Input };
