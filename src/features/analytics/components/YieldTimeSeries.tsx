import { AreaChartDefault } from "@/core/components/ui/area-chart";
import { YieldTimeSeries } from "../schemas/yieldTimeSeries";
import { YIELD_CHART_CONFIG } from "../config";

export function YieldTimeSeriesChart({ data }: { data: YieldTimeSeries }) {
  return (
    <AreaChartDefault
      title="Overall Yield Trend"
      description="Tracking average yield (t/ha) by month"
      className="h-56"
      data={data.map(({ month_year, avg_yield_t_ha }) => ({
        month_year: month_year,
        avg_yield_t_ha: avg_yield_t_ha,
      }))}
      xDataKey="month_year"
      yDataKey="avg_yield_t_ha"
      config={YIELD_CHART_CONFIG}
    />
  )
}
