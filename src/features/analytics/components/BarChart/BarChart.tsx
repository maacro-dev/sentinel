import { memo, JSX } from "react";
import { ChartConfig, ChartContainer } from "@/core/components/ui/chart";
import { chartContainerDefaults } from "../../config";
import { ChartHeader, AxisKeys, AxisOptions } from "../../types";
import { ChartCard } from "../ChartCard";
import { BarChartDefaults } from "./Defaults";
import { InternalBarChart } from "./InternalBarChart";

interface BarChartProps<T> {
  data: T[];
  header: ChartHeader;
  axisKeys: AxisKeys<T>;
  axisOptions?: AxisOptions;
  config?: ChartConfig;
}

export const BarChart = memo(<T extends object>({
  data,
  header,
  axisKeys,
  axisOptions,
  config = {},
}: BarChartProps<T>) => {
  return (
    <ChartCard header={header}>
      <ChartContainer config={config} className={chartContainerDefaults.className}>
        <InternalBarChart
          data={data}
          margin={BarChartDefaults.margins}
          axisKeys={axisKeys}
          axisOptions={axisOptions}
          config={config}
        />
      </ChartContainer>
    </ChartCard>
  );
}) as <T extends object>(props: BarChartProps<T>) => JSX.Element;
