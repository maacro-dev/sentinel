import { cn } from "@/lib/utils";
import { Minus, ArrowUpRight, ArrowDownRight } from "lucide-react"; // Assuming you're using Lucide icons

interface TrendIconProps {
  value: number | null | undefined;
  className?: string;
}

export const TrendIcon = ({
  value,
  className
}: TrendIconProps) => {

  if (value === null || value === undefined) {
    return null;
  }

  if (value > 0) { return <ArrowUpRight className={cn("size-3.5 animate-pulse text-humay", className)} />; }
  if (value < 0) { return <ArrowDownRight className={cn("size-3.5 animate-pulse text-red-500", className)} />; }
  if (value === 0) { return <Minus className={cn("size-3.5 animate-pulse text-muted-foreground/75", className)} />; }
};
