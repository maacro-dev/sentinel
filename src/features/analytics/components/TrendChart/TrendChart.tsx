import { memo, JSX } from "react";
import { ChartConfig, ChartContainer } from "@/core/components/ui/chart";
import { chartContainerDefaults } from "../../config";
import { useTimeFilter } from "../../hooks/useTimeFilter";
import { ChartHeader, AxisKeys, AxisOptions } from "../../types";
import { ChartCard } from "../ChartCard";
import { TimeRangeSelector } from "../TimeRangeSelector";
import { InternalTrendChart } from "./InternalTrendChart";
import { TrendChartDefaults } from "./Defaults";
import { cn } from "@/core/utils/style";

interface TrendChartProps<T extends object> {
  data: T[];
  header: ChartHeader;
  axisKeys: AxisKeys<T>;
  axisOptions?: AxisOptions;
  config?: ChartConfig;
  enableTimeRange?: boolean;
  containerClass?: string;
}

export const TrendChart = memo(<T extends object>({
  data,
  header,
  axisKeys,
  axisOptions,
  config = {},
  enableTimeRange = false,
  containerClass
}: TrendChartProps<T>) => {

  const { filteredData, timeRange, setTimeRange } = useTimeFilter({
    data: data,
    dateKey: axisKeys.X,
    enabled: enableTimeRange,
  });

  return (
    <ChartCard
      header={header}
      config={config}
      options={{
        enabled: enableTimeRange,
        component: <TimeRangeSelector timeRange={timeRange} setTimeRange={setTimeRange} />
      }}
    >
      <ChartContainer config={config} className={cn(chartContainerDefaults.className, containerClass)}>
        <InternalTrendChart
          data={filteredData}
          margin={TrendChartDefaults.margins}
          axisKeys={axisKeys}
          enableTimeRange={enableTimeRange}
          axisOptions={axisOptions}
          timeRange={timeRange}
        />
      </ChartContainer>
    </ChartCard>
  )
}) as <T extends object>(props: TrendChartProps<T>) => JSX.Element;
