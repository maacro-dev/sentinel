// @ts-nocheck

import { ChartTooltip, ChartTooltipContent } from "@/core/components/ui/chart";
import { ComponentProps } from "react";
import { CartesianGrid, XAxis, YAxis, AreaChart } from "recharts";
import { useDateAxis } from "../../hooks/useDateAxis";
import { AxisKeys, AxisOptions, TimeRange } from "../../types";
import { TrendChartDefaults } from "./Defaults";
import { Area } from "./Area";

interface InternalTrendChartProps<T> extends ComponentProps<typeof AreaChart> {
  axisKeys: AxisKeys<T>;
  axisOptions?: AxisOptions;
  enableTimeRange?: boolean;
}

export const InternalTrendChart = <T,>({
  axisKeys,
  axisOptions,
  enableTimeRange,
  ...props
}: InternalTrendChartProps<T>) => {

  return (
    <AreaChart {...props} accessibilityLayer>
      <CartesianGrid vertical={false} strokeDasharray="3 3" />
      <XAxis
        dataKey={axisKeys.X}
        {...TrendChartDefaults.axis}
        {...axisOptions?.X}
      />
      <YAxis {...TrendChartDefaults.axis} tickCount={4} {...axisOptions?.Y} />
      <ChartTooltip cursor={false} content={
        <ChartTooltipContent
          indicator="line"
          color="var(--color-humay)"
        />
      }/>
      <Area axisKey={axisKeys.Y} />
    </AreaChart>
  )
}
