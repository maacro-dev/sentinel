import { cn } from "@/core/utils/style";
import { Badge } from "@/core/components/ui/badge";
import { TrendIcon } from "./TrendIcon";
import { memo } from "react";

interface ChangeBadgeProps {
  currentValue: number;
  previousValue: number;
}

const getColor = (v: number) => {
  if (v > 0) return "bg-green-100 text-green-600";
  else if (v < 0) return "bg-red-100 text-red-600";
  else return ""
}

export const ChangeBadge = memo(({ currentValue, previousValue }: ChangeBadgeProps) => {
  const baseClasses = "rounded-md align-middle py-0.5 px-1.5 text-5xs dt:text-4xs";
  const percent = ((currentValue - previousValue) / previousValue) * 100;

  return (
    <Badge variant="secondary" className={cn(baseClasses, getColor(percent))}>
      {currentValue === 0 ? "No change" : <><TrendIcon value={percent} />{percent}%</>}
      {/* <><TrendIcon value={value} />{value}%</> */}
    </Badge>
  );
});
