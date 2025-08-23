import { cn } from "@/core/utils/style";
import { Badge } from "@/core/components/ui/badge";
import { TrendIcon } from "./TrendIcon";
import { memo } from "react";

interface ChangeBadgeProps {
  value: number;
}

const getColor = (v: number) => {
  if (v > 0) return "bg-green-100 text-green-600";
  else if (v < 0) return "bg-red-100 text-red-600";
  else return ""
}

export const ChangeBadge = memo(({ value }: ChangeBadgeProps) => {
  const baseClasses = "rounded-md align-middle py-0.5 px-1.5 text-5xs dt:text-4xs";

  return (
    <Badge variant="secondary" className={cn(baseClasses, getColor(value))}>
      {/* {value === 0 ? "No change" : <><TrendIcon value={value} />{value}%</>} */}
      <><TrendIcon value={value} />{value}%</>
    </Badge>
  );
});
