import Logo from "@/assets/logo.svg?react";

interface HumayLogoProps extends React.ComponentProps<"div">{
  size?: number;
  hideLabel?: boolean;
}

export function HumayLogo({ hideLabel = false, size = 12, ...props }: HumayLogoProps) {
  return (
    <div className="flex items-center gap-2" {...props}>
      <Logo className={`rounded-lg aspect-square size-${size}`} />
      {!hideLabel && (
        <div className="flex flex-col">
          <span className="truncate text-sm font-medium leading-tight">Humay</span>
          <span className="truncate text-xs text-muted-foreground/60">Sentinel</span>
        </div>
      )}
    </div>
  );
}
