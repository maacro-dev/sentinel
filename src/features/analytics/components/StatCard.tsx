import { memo, useId } from "react";
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
import { INVERTED_METRIC_KEYS } from "../config";
import { Area, AreaChart, ResponsiveContainer } from "recharts";
import { cn } from "@/core/utils/style";


export interface StatCardProps extends Omit<Stat, "percent_change"> {
  percent_change?: number | undefined;
  statKey?: string | undefined;
}

export const StatCard = memo(
  ({
    title,
    subtitle,
    current_value,
    unit,
    percent_change,
    statKey,
  }: StatCardProps) => {
    let displayPercent = percent_change;

    if (Number(current_value) === 0) {
      displayPercent = 0;
    }

    const shouldShowBadge =
      typeof displayPercent === "number" &&
      isFinite(displayPercent) &&
      displayPercent !== 0;

    const inverted = statKey ? INVERTED_METRIC_KEYS.has(statKey) : false;

    return (
      <Card className="flex-1 h-full flex flex-col gap-2.5 justify-between rounded-container transition-all">
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

          {shouldShowBadge && (
            <ChangeBadge percent={displayPercent} inverted={inverted} />
          )}
        </CardContent>
      </Card>
    );
  },
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



interface ExtraCompare {
  value: number;
  unit: string;
  label: string;
  meta?: string;
}

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
  extraCompares?: ExtraCompare[];
  hidePrimary?: boolean;
}

export const StatCardComparison = memo(
  ({
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
    extraCompares = [],
    hidePrimary = false,
  }: StatCardComparisonProps) => {
    const renderRow = (
      label: string,
      value: number,
      unit: string,
      meta?: string
    ) => {
      const displayValue =
        value != null
          ? unit === ''
            ? value.toFixed(0)
            : value.toFixed(2)
          : '—';

      return (
        <div className="flex justify-between items-baseline" key={label}>
          <span className="text-xs font-medium text-muted-foreground">{label}</span>
          <div className="flex items-baseline gap-1">
            {meta ? (
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
          {!hidePrimary && renderRow(currentLabel, currentValue, currentUnit, currentMeta)}
          {renderRow(compareLabel, compareValue, compareUnit, compareMeta)}
          {extraCompares.map(({ label, value, unit, meta }) =>
            renderRow(label, value, unit, meta)
          )}
        </CardContent>
      </Card>
    );
  }
);


function getDisplaySizeClass(text: string | undefined): string {
  if (!text) return 'text-base lt:text-lg dt:text-xl hd:text-2xl';
  const len = text.length;
  if (len <= 10) return 'text-base lt:text-lg dt:text-xl hd:text-2xl';
  if (len <= 20) return 'text-sm lt:text-base dt:text-lg hd:text-xl';
  return 'text-xs  lt:text-sm dt:text-base hd:text-lg';
}

interface StatCardSparklineProps {
  title: string;
  subtitle?: string;
  value: number;
  unit?: string;
  display?: React.ReactNode;
  tooltip?: React.ReactNode;
  trend?: { label: string; value: number }[];
  trendColor?: string;
  inverted?: boolean;
}

export const StatCardSparkline = memo(({
  title,
  subtitle,
  value,
  unit,
  tooltip,
  trend = [],
  display,
  trendColor = "oklch(62.7% 0.194 149.214)",
  inverted
}: StatCardSparklineProps) => {
  const first = trend[0]?.value;
  const last = trend[trend.length - 1]?.value;
  const delta = first != null && last != null ? last - first : null;
  const isUp = delta != null && delta > 0;
  const isDown = delta != null && delta < 0;

  const upColor = inverted ? 'text-destructive' : 'text-humay';
  const downColor = inverted ? 'text-humay' : 'text-destructive';
  const deltaColor = isUp ? upColor : isDown ? downColor : 'text-muted-foreground';

  const displayText = typeof display === 'string' ? display : (value != null ? Number(value).toFixed(2) : '-');
  const sizeClass = getDisplaySizeClass(typeof display === 'string' ? display : undefined);

  const gradientId = useId();
  const sparkColor = inverted
    ? 'oklch(50% 0.2 10)'
    : trendColor;

  return (
    <Card className="flex-1 h-full min-h-36 flex flex-col gap-2.5 justify-between rounded-container hover:shadow-sm transition-all">
      <CardHeader className="flex flex-col gap-0.5">
        <CardTitle className="leading-none font-medium text-primary">{title}</CardTitle>
        {subtitle && (
          <CardDescription className="text-left font-light text-muted-foreground">
            {subtitle}
          </CardDescription>
        )}
      </CardHeader>

      <CardContent className="flex flex-row items-end justify-between gap-2">
        <div className="flex items-baseline gap-1.5 whitespace-nowrap">
          {tooltip ? (
            <TooltipProvider >
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="inline-flex items-baseline cursor-help">
                    <span className={cn("font-semibold", sizeClass, "leading-none")}>
                      {displayText}
                    </span>
                    {unit && !display && (
                      <span className="text-5xs lt:text-4xs dt:text-3xs font-light text-muted-foreground ml-1.5">
                        {unit}
                      </span>
                    )}
                  </span>
                </TooltipTrigger>
                <TooltipContent side="top" align="center">
                  <p className="text-xs">{tooltip}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ) : (
            <>
              <span className={cn("font-semibold", sizeClass, "leading-none")}>
                {displayText}
              </span>
              {unit && !display && (
                <span className="text-5xs lt:text-4xs dt:text-3xs font-light text-muted-foreground">
                  {unit}
                </span>
              )}
            </>
          )}
        </div>

        <div className="flex items-end gap-1.5">
          {delta != null && (
            <span className={cn("text-xs font-medium shrink-0", deltaColor)}>
              {isUp ? "▲" : isDown ? "▼" : "–"} {Math.abs(delta).toFixed(2)}
            </span>
          )}
          {trend.length > 1 && (
            <div className="w-24 h-10 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trend} margin={{ top: 2, right: 2, bottom: 2, left: 2 }}>
                  <defs>
                    <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={sparkColor} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={sparkColor} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke={sparkColor}
                    strokeWidth={1.5}
                    fill={`url(#${gradientId})`}
                    dot={false}
                    isAnimationActive={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
});
