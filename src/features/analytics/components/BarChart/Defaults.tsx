import { ChartTooltipContent } from "@/core/components/ui/chart";

export const BarChartDefaults = {
  margins: { top: 32,  bottom: 40, left: -32, right: -32 },
  axis: {
    tickLine: false,
    axisLine: false,
    tickMargin: 40,
    minTickGap: 16,
  },
  tooltip: {
    cursor: false,
    content: <ChartTooltipContent indicator="line" color="var(--color-humay)" />
  },
  bar: {
    radius: 8,
    maxBarSize: 56,
    minPointSize: 10,
  }
}
