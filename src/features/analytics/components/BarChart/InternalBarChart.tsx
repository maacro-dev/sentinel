import { ComponentProps } from "react";
import { ChartConfig, ChartTooltip } from "@/core/components/ui/chart";
import {  BarChart as PrimitiveBarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { BarChartDefaults } from "./Defaults";
import { AxisKeys, AxisOptions } from "../../types";
import { Bar } from "./Bar";

interface InternalBarChartProps extends ComponentProps<typeof PrimitiveBarChart> {
  axisKeys: AxisKeys<any>;
  axisOptions?: AxisOptions;
  config: ChartConfig;
  onBarClick?: (item: any) => void;
  activeBar?: any;
}

export const InternalBarChart = ({
  axisKeys,
  axisOptions,
  config,
  onBarClick,
  activeBar,
  ...props
}: InternalBarChartProps) => {

  return (
    <PrimitiveBarChart
      {...props}
      accessibilityLayer
      {...BarChartDefaults.barChart}
    >
      <CartesianGrid vertical={false} strokeDasharray="3 3" />
      <XAxis dataKey={axisKeys.X} {...BarChartDefaults.axis} {...axisOptions?.X} />
      <YAxis dataKey={axisKeys.Y} {...axisOptions?.Y} />
      <ChartTooltip {...BarChartDefaults.tooltip} />
      <Bar
        axisKey={axisKeys.Y}
        onClick={onBarClick}
        activeBar={activeBar}
        dataLength={props.data?.length}
      />
    </PrimitiveBarChart>
  )
}
