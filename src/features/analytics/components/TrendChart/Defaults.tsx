
export const TrendChartDefaults = {
  margins: { top: 64, right: 64, left: 16, bottom: 32 },
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
