import { cn } from "@/core/utils/style";
import { Badge } from "@/core/components/ui/badge";
import { memo } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/core/components/ui/tooltip";

interface ChangeBadgeProps {
  percent?: number;
  inverted?: boolean;
}

export const ChangeBadge = memo(
  ({ percent, inverted = false }: ChangeBadgeProps) => {
    const baseClasses =
      "rounded-md align-middle py-0.5 px-1.5 text-5xs dt:text-4xs";

    const hasChange = typeof percent === "number" && isFinite(percent);

    let color: string;
    let displayText: string;
    let tooltipText: string;

    if (!hasChange) {
      color = "bg-gray-100 text-gray-500";
      displayText = "---";
      tooltipText = "No data from the previous season";
    } else if (percent === 0) {
      color = "bg-gray-100 text-gray-500";
      displayText = "No change";
      tooltipText = "No change compared to previous season";
    } else {
      const isGood = inverted ? percent < 0 : percent > 0;
      color = isGood
        ? "bg-green-100 text-green-600"
        : "bg-red-100 text-red-600";

      const arrow = percent < 0 ? "↓" : "↑";
      const absValue = Math.abs(percent);
      displayText = `${arrow} ${absValue}%`;

      const direction = percent < 0 ? "Decreased" : "Increased";
      const evaluation = isGood ? "Positive" : "Negative";
      tooltipText = `${direction} by ${absValue}% — ${evaluation}`;
    }

    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge
            variant="secondary"
            className={cn(baseClasses, color)}
          >
            {displayText}
          </Badge>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p className="text-5xs">{tooltipText}</p>
        </TooltipContent>
      </Tooltip>
    );
  },
);
