import { ChartTooltipContent } from "@/core/components/ui/chart";

export const BarChartDefaults = {
  margins: { top: 30,  bottom: 40, left: 0, right: 0 },
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
    radius: [8, 8, 4, 4],
  },
  barChart: {
    barCategoryGap: "32%",
    animationDuration: 800,
    barGap: 8
  }
}
