import { ComponentProps } from "react";
import { ChartConfig, ChartTooltip } from "@/core/components/ui/chart";
import { BarChart as PrimitiveBarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { BarChartDefaults } from "./Defaults";
import { AxisKeys, AxisOptions } from "../../types";
import { Bar } from "./Bar";

interface InternalBarChartProps extends ComponentProps<typeof PrimitiveBarChart> {
  axisKeys: AxisKeys<any>;
  axisOptions?: AxisOptions;
  config: ChartConfig;
  onBarClick?: (item: any) => void;
  activeBar?: any;
  layout: "vertical" | "horizontal";
}

export const InternalBarChart = ({
  axisKeys,
  axisOptions,
  config,
  onBarClick,
  activeBar,
  layout,
  ...props
}: InternalBarChartProps) => {
  const isVertical = layout === 'vertical';
  const barDataKey = isVertical ? axisKeys.X : axisKeys.Y;

  const baseMargins = BarChartDefaults.margins;
  const margins = isVertical
    ? { ...baseMargins, left: 60, right: 60 }
    : { ...baseMargins, bottom: 60, left: 40 };

  return (
    <PrimitiveBarChart
      accessibilityLayer
      layout={layout}
      {...BarChartDefaults.barChart}
      margin={margins}
      {...props}
    >
      <CartesianGrid
        vertical={isVertical}
        horizontal={!isVertical}
        strokeDasharray="3 3"
      />
      {isVertical ? (
        <>
          <XAxis type="number" {...BarChartDefaults.axis} {...axisOptions?.X} />
          <YAxis type="category" dataKey={axisKeys.Y} {...axisOptions?.Y} />
        </>
      ) : (
        <>
          <XAxis type="category" dataKey={axisKeys.X} {...BarChartDefaults.axis} {...axisOptions?.X} />
          <YAxis type="number" {...axisOptions?.Y} />
        </>
      )}
      <ChartTooltip {...BarChartDefaults.tooltip} />
      <Bar
        axisKey={barDataKey}
        onClick={onBarClick}
        activeBar={activeBar}
        dataLength={props.data?.length}
        layout={layout}
      />
    </PrimitiveBarChart>
  );
};
