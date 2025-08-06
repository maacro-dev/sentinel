
export const TrendChartDefaults = {
  margins: { top: 28, right: 48, left: 0, bottom: 32 },
  axis: {
    tickLine: false,
    axisLine: false,
    tickMargin: 40,
    minTickGap: 48,
  },
  area: {
    type: "monotone" as const,
    stroke: "var(--color-humay)",
    fill: "url(#fillColor)",
    animationDuration: 800,
    activeDot: { r: 6 },
  },
}
