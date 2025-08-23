import { memo } from "react";
import { TrendChart } from "./TrendChart";
import { OverallYieldPoint } from "../schemas/trends/overallYield";

export const OverallYieldTrendChart = memo(({ data }: { data: Array<OverallYieldPoint> }) => {
  return (
    <TrendChart
      data={data}
      header={{
        title: "Overall Yield Trend",
        description: "Tracking average yield (t/ha) by month"
      }}
      axisKeys={{ X: "date", Y: "avg_yield_t_ha" }}
      axisOptions={{ X: { interval: 0 } }}
      config={{ avg_yield_t_ha: { label: "Average Yield (t/ha)" } }}
      containerClass="min-h-64"
    />
  )
})
