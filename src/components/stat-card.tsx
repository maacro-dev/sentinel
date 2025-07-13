import { memo } from "react";
import { TrendIcon } from "./trend-icon";
import { Card, CardHeader, CardDescription, CardTitle, CardFooter } from "./ui/card";

export interface StatCardProps {
  title: string;
  subtitle?: string;
  value: number | string | null | undefined;
  unit?: string;
  percentChange?: number | null;
  message?: string;
}

export const StatCard = memo(({
  title,
  subtitle,
  value,
  unit,
  percentChange,
  message,
}: StatCardProps) => {
  const hasPercentChange = percentChange !== null && percentChange !== undefined;

  return (
    <Card className="flex flex-col justify-between p-6 shadow-none">
      <CardHeader className="flex flex-col gap-4 p-0">
        <div className="space-y-1.5">
          <CardDescription className="leading-none text-primary/75 md:text-xs lg:text-sm">
            {title}
          </CardDescription>
          {subtitle && (
            <span className="block text-[0.6rem] md:text-[0.625rem] lg:text-[0.675rem] font-light text-muted-foreground/75 leading-tight">
              {subtitle}
            </span>
          )}
        </div>
        <CardTitle className="space-x-2 text-lg font-semibold tabular-nums lg:text-2xl md:text-xl">
          <span>{value ?? "-"}</span>
          {unit && (
            <span className="text-xs lg:text-[0.9rem] font-light text-muted-foreground/75">
              {unit}
            </span>
          )}
        </CardTitle>
      </CardHeader>

      <CardFooter className="text-xs text-muted-foreground/75 p-0">
        {hasPercentChange ? (
          <div>
            <span>
              {percentChange === 0 ? (
                <>No change from last season</>
              ) : (
                <>
                  {percentChange > 0 ? "+" : ""}
                  {percentChange}%
                  {" from last season "}
                  <TrendIcon
                    value={percentChange}
                    className="inline-block"
                  />
                </>
              )}
            </span>
          </div>
        ) : message ? (
          <span>{message}</span>
        ) : (
          <span>No data available</span>
        )}
      </CardFooter>
    </Card>
  );
});
