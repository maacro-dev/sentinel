import { memo } from "react";
import { ChartConfig } from "@/core/components/ui/chart";
import { BarChart } from "@/features/analytics/components/BarChart";
import { TickProps } from "@/features/analytics/types";
import { DefaultTicks } from "@/features/analytics/components/DefaultTicks";
import { FertilizerTypeSummary } from "../schemas/summary/fertilizer-type";

interface FertilizerTypeBarChartProps {
  data: FertilizerTypeSummary;
}

export const FertilizerTypeBarChart = memo(({ data }: FertilizerTypeBarChartProps) => {
  const chartData = data.ranking.map(item => ({
    type: item.type,
    count: item.count,
  }));

  const isEmpty = chartData.length === 0 || chartData.every(d => d.count === 0);


  const chartConfig = data.ranking.reduce((acc, item) => {
    acc[item.type] = { label: item.type };
    return acc;
  }, {} as ChartConfig);
  chartConfig.count = { label: 'Applications' };

  let domain: [number, number] | undefined;
  const counts = chartData.map(d => d.count).filter(c => c > 0);
  if (counts.length > 0) {
    const minVal = Math.min(...counts);
    const maxVal = Math.max(...counts);
    const padding = (maxVal - minVal) * 0.1;
    domain = [Math.max(0, minVal - padding), maxVal + padding];
  }

  return (
    <BarChart
      config={chartConfig}
      data={chartData}
      header={{
        title: 'Fertilizer Usage',
        description: 'Number of applications by fertilizer type',
      }}
      axisKeys={{ X: 'type', Y: 'count' }}
      isEmpty={isEmpty}
      axisOptions={{
        X: {
          interval: 0,
          tick: ({ x, y, payload }: TickProps) => <DefaultTicks x={x} y={y} payload={payload} />,
        },
        Y: {
          tickFormatter: (value: number) => value.toString(),
          domain,
        },
      }}
      cardClass="h-full min-h-120"
    />
  );
});
