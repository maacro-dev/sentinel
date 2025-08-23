import { ComponentProps } from "react";
import { ChartConfig, ChartTooltip } from "@/core/components/ui/chart";
import {  BarChart as PrimitiveBarChart, CartesianGrid, XAxis } from "recharts";
import { BarChartDefaults } from "./Defaults";
import { AxisKeys, AxisOptions } from "../../types";
import { Bar } from "./Bar";

interface InternalBarChartProps extends ComponentProps<typeof PrimitiveBarChart> {
  axisKeys: AxisKeys<any>;
  axisOptions?: AxisOptions;
  config: ChartConfig;
}

export const InternalBarChart = ({
  axisKeys,
  axisOptions,
  config,
  ...props
}: InternalBarChartProps) => {

  return (
      <PrimitiveBarChart {...props} accessibilityLayer {...BarChartDefaults.barChart}>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis dataKey={axisKeys.X} {...BarChartDefaults.axis} {...axisOptions?.X} />
        <ChartTooltip {...BarChartDefaults.tooltip} />
        <Bar axisKey={axisKeys.Y} config={config} />
      </PrimitiveBarChart>
  )
}
