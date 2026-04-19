import { memo } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/core/components/ui/card";
import { ChangeBadge } from "./ChangeBadge";
import { Stat } from "../types";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/core/components/ui/tooltip';

export interface StatCardProps extends Omit<Stat, "percent_change"> {
  percent_change?: number | undefined;
}

export const StatCard = memo(
  ({ title, subtitle, current_value, unit, percent_change }: StatCardProps) => {
    let displayPercent: number | undefined = percent_change;

    if (Number(current_value) === 0) {
      displayPercent = 0;
    }

    const shouldShowBadge =
      typeof displayPercent === "number" &&
      isFinite(displayPercent) &&
      displayPercent !== 0;

    return (
      <Card className="flex-1 h-full flex flex-col gap-2.5 justify-between hover:cursor-pointer rounded-container hover:shadow-sm transition-all">
        <CardHeader className="flex flex-col gap-0.5 lt:gap-1 dt:gap-1.5">
          <CardTitle className="leading-none font-medium text-primary">
            {title}
          </CardTitle>
          <CardDescription className="text-left font-light text-muted-foreground">
            {subtitle}
          </CardDescription>
        </CardHeader>

        <CardContent className="flex flex-row items-end justify-between">
          <div className="space-x-1.5">
            <span className="space-x-2 font-semibold text-lg lt:text-xl dt:text-2xl hd:text-3xl">
              {current_value ?? "-"}
            </span>
            <span className="text-5xs lt:text-4xs dt:text-3xs font-light text-muted-foreground">
              {unit}
            </span>
          </div>

          {shouldShowBadge && <ChangeBadge percent={displayPercent} />}
        </CardContent>
      </Card>
    );
  }
);


interface StatCardMinimalProps extends Omit<Stat, "previous_value" | "percent_change"> { }

export const StatCardMinimal = memo(({ title, subtitle, current_value, unit }: StatCardMinimalProps) => {
  return (
    <Card
      role="stat-card-simple"
      className="flex-1 h-full min-h-36 flex flex-col gap-2.5 justify-between hover:cursor-pointer rounded-container hover:shadow-sm transition-all"
    >
      <CardHeader className="flex flex-col gap-0.5 lt:gap-1 dt:gap-1.5">
        <CardTitle className="leading-none font-medium text-primary">
          {title}
        </CardTitle>
        <CardDescription className="text-left font-light text-muted-foreground">
          {subtitle}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-row items-center justify-between">
        <div className="space-x-1.5">
          <span className="space-x-2 font-semibold text-lg lt:text-xl dt:text-2xl hd:text-3xl">
            {current_value ?? "-"}
          </span>
          <span className="text-5xs lt:text-4xs dt:text-3xs font-light text-muted-foreground">
            {unit}
          </span>
        </div>
      </CardContent>
    </Card>
  );
});


interface StatCardComparisonProps {
  title: string;
  subtitle: string;
  currentValue: number;
  currentUnit: string;
  compareValue: number;
  compareUnit: string;
  currentLabel: string;
  compareLabel: string;
  currentMeta?: string;
  compareMeta?: string;
}

export const StatCardComparison = memo(({
  title,
  subtitle,
  currentValue,
  currentUnit,
  compareValue,
  compareUnit,
  currentLabel,
  compareLabel,
  currentMeta,
  compareMeta,
}: StatCardComparisonProps) => {
  const renderRow = (
    label: string,
    value: number,
    unit: string,
    meta?: string
  ) => {
    // Format as integer if no unit (e.g., record counts), otherwise two decimals
    const displayValue = unit === "" ? value.toFixed(0) : value.toFixed(2);
    const hasMeta = !!meta;

    return (
      <div className="flex justify-between items-baseline">
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
        <div className="flex items-baseline gap-1">
          {hasMeta ? (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="text-sm font-semibold cursor-help">{meta}</span>
                </TooltipTrigger>
                <TooltipContent side="top" className="text-xs">
                  {displayValue} {unit}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : (
            <div className="space-x-1">
              <span className="font-semibold text-lg">{displayValue}</span>
              {unit && <span className="text-5xs font-light text-muted-foreground">{unit}</span>}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <Card className="flex-1 h-full min-h-36 flex flex-col gap-2.5 justify-between rounded-container hover:shadow-sm transition-all">
      <CardHeader className="flex flex-col gap-0.5 lt:gap-1 dt:gap-1.5">
        <CardTitle className="leading-none font-medium text-primary">{title}</CardTitle>
        <CardDescription className="text-left font-light text-muted-foreground">{subtitle}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {renderRow(currentLabel, currentValue, currentUnit, currentMeta)}
        {renderRow(compareLabel, compareValue, compareUnit, compareMeta)}
      </CardContent>
    </Card>
  );
});
