// design scheme

import { memo, JSX } from "react";
import { ChartConfig, ChartContainer } from "@/core/components/ui/chart";
import { chartContainerDefaults } from "../../config";
import { ChartHeader, AxisKeys, AxisOptions } from "../../types";
import { ChartCard } from "../ChartCard";
import { InternalTrendChart } from "./InternalTrendChart";
import { TrendChartDefaults } from "./Defaults";
import { cn } from "@/core/utils/style";
import { Global } from "@/core/config";

interface TrendChartProps<T extends object> {
  data: T[];
  header: ChartHeader;
  axisKeys: AxisKeys<T>;
  axisOptions?: AxisOptions;
  config?: ChartConfig;
  enableTimeRange?: boolean;
  containerClass?: string;
  cardClass?: string;
  isEmpty: boolean;
}

export const TrendChart = memo(<T extends object>({
  data,
  header,
  axisKeys,
  axisOptions,
  config = {},
  enableTimeRange = false,
  isEmpty = false,
  cardClass,
  containerClass
}: TrendChartProps<T>) => {
  return (
    <ChartCard
      className={cardClass}
      header={header}
      config={config}
    >
      {isEmpty ? (
        <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
          {Global.NO_DATA_MESSAGE}
        </div>
      ) : (
        <ChartContainer config={config} className={cn(chartContainerDefaults.className, containerClass)}>
          <InternalTrendChart
            data={data}
            margin={TrendChartDefaults.margins}
            axisKeys={axisKeys}
            enableTimeRange={enableTimeRange}
            axisOptions={axisOptions}
          />
        </ChartContainer>
      )}
    </ChartCard>
  );
}) as <T extends object>(props: TrendChartProps<T>) => JSX.Element;
