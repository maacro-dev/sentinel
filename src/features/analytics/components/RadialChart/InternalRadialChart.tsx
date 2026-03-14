import { ComponentProps } from "react";
import { RadialBarChart, PolarRadiusAxis, Label } from "recharts";
import { ChartTooltip } from "@/core/components/ui/chart";
import { RadialChartDefaults } from "./Defaults";

interface InternalRadialChartProps extends ComponentProps<typeof RadialBarChart> {
  showTooltip?: boolean;
  showPolarRadiusAxis?: boolean;
  centerLabel?: (viewBox: any) => React.ReactNode;
}

export const InternalRadialChart = ({
  children,
  showTooltip = true,
  showPolarRadiusAxis = true,
  centerLabel,
  ...props
}: InternalRadialChartProps) => {
  return (
    <RadialBarChart {...RadialChartDefaults.chart} {...props} >
      {showTooltip && (
        <ChartTooltip {...RadialChartDefaults.tooltip} />
      )}
      <PolarRadiusAxis
        tick={false}
        tickLine={false}
        axisLine={false}
      >
        {centerLabel && (
          // @ts-ignore
          <Label content={centerLabel} />
        )}
      </PolarRadiusAxis>
      {children}
    </RadialBarChart>
  );
};
