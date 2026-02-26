import { memo, JSX } from "react";
import { ChartConfig, ChartContainer } from "@/core/components/ui/chart";
import { chartContainerDefaults } from "../../config";
import { ChartHeader, AxisKeys, AxisOptions } from "../../types";
import { ChartCard } from "../ChartCard";
import { BarChartDefaults } from "./Defaults";
import { InternalBarChart } from "./InternalBarChart";
import { cn } from "@/core/utils/style";

interface BarChartProps<T> {
  data: T[];
  header: ChartHeader;
  axisKeys: AxisKeys<T>;
  axisOptions?: AxisOptions;
  config?: ChartConfig;
  isEmpty: boolean,
  containerClass?: string,
  cardClass?: string,
}

export const BarChart = memo(<T extends object>({
  data,
  header,
  axisKeys,
  axisOptions,
  isEmpty = false,
  config = {},
  containerClass,
  cardClass
}: BarChartProps<T>) => {

  console.log(data)

  return (
    <ChartCard header={header} className={cardClass}>
      {isEmpty ? (
        <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
          No data available for this period
        </div>
      ) : (
        <ChartContainer config={config} className={cn(chartContainerDefaults.className, containerClass)}>
          <InternalBarChart
            data={data}
            margin={BarChartDefaults.margins}
            axisKeys={axisKeys}
            axisOptions={axisOptions}
            config={config}
          />
        </ChartContainer>
      )}

    </ChartCard>
  );
}) as <T extends object>(props: BarChartProps<T>) => JSX.Element;
