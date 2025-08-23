import { ChartTooltipContent } from "@/core/components/ui/chart";

export const BarChartDefaults = {
  margins: { top: 32,  bottom: 40, left: 0, right: 0 },
  axis: {
    tickLine: false,
    axisLine: false,
    tickMargin: 40,
    minTickGap: 0,
  },
  tooltip: {
    cursor: false,
    content: <ChartTooltipContent indicator="line" color="var(--color-humay)" />
  },
  bar: {
    radius: 8,
  },
  barChart: {
    barCategoryGap: "24%"
  }
}
