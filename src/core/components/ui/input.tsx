import * as React from "react";
import { cn } from "@/core/utils/style";

interface InputProps extends React.ComponentProps<"input"> {
  renderPrefix?: (focused: boolean) => React.ReactNode;
  renderSuffix?: (focused: boolean) => React.ReactNode;
  containerClassName?: string;
  [key: `data-${string}`]: string;
}


function Input({
  className,
  containerClassName,
  type,
  renderPrefix,
  renderSuffix,
  onFocus,
  onBlur,
  ...props
}: InputProps) {
  const [focused, setFocused] = React.useState(false);

  return (
    <div
      data-error={props["data-error"]}
      className={cn(
        "w-full rounded-md bg-white px-2 py-2 relative inline-flex items-center gap-2",
        "transition-all ring ring-muted-foreground/25",
        "focus-within:ring-2 focus-within:ring-ring",
        "data-[error=true]:ring-error data-[error=true]:ring-2",
        // "data-[error=true]:border-2",
        containerClassName
      )}

    >
      {renderPrefix?.(focused)}
      <input
        type={type}
        data-slot="input"
        onFocus={(e) => {
          setFocused(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          onBlur?.(e);
        }}
        className={cn(
          "w-full file:text-foreground placeholder:text-2xs placeholder:text-muted-foreground/50 selection:bg-primary selection:text-primary-foreground dark:bg-input/30 text-base file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
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
