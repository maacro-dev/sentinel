import { cn } from "@/core/utils/style";
import { Badge } from "@/core/components/ui/badge";
import { TrendIcon } from "./TrendIcon";
import { memo } from "react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/core/components/ui/tooltip";

const getColor = (v: number) => {
  if (v > 0) return "bg-green-100 text-green-600";
  else if (v < 0) return "bg-red-100 text-red-600";
  else return ""
}

interface ChangeBadgeProps {
  currentValue: string | number;
  previousValue?: number;
}

export const ChangeBadge = memo(
  ({ currentValue, previousValue }: ChangeBadgeProps) => {
    const baseClasses = "rounded-md align-middle py-0.5 px-1.5 text-5xs dt:text-4xs";

    // @ts-ignore
    const percent = previousValue && previousValue !== 0 ? ((currentValue - previousValue) / previousValue) * 100 : undefined;

    const hasChange = typeof percent === "number" && isFinite(percent);
    const showTooltip = previousValue == null;

    const badge = (
      <Badge
        variant="secondary"
        className={cn(baseClasses, hasChange ? getColor(percent) : undefined)}
      >
        {!hasChange ? (
          "---"
        ) : percent === 0 ? (
          "No change"
        ) : (
          <>
            <TrendIcon value={percent} />
            {percent}%
          </>
        )}
      </Badge>
    );

    if (!showTooltip) return badge;

    return (
      <Tooltip>
        <TooltipTrigger asChild>{badge}</TooltipTrigger>
        <TooltipContent side="bottom">
          <p className="text-5xs">No data from the previous season</p>
        </TooltipContent>
      </Tooltip>
    );
  }
);
