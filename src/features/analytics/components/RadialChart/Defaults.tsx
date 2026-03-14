import { ChartTooltipContent } from "@/core/components/ui/chart";

export const RadialChartDefaults = {
  chart: {
    endAngle: 180,
    innerRadius: 60,
    outerRadius: 100,
    cy: "75%",
    barSize: 14,
  },
  tooltip: {
    cursor: false,
    content: <ChartTooltipContent hideLabel />
  },
  bar: {
    stackId: "a",
    cornerRadius: 5,
    className: "stroke-transparent stroke-2",
    animationDuration: 600,
  },
};
