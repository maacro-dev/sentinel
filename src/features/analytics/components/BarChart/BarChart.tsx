import { memo, JSX } from "react";
import { ChartConfig, ChartContainer } from "@/core/components/ui/chart";
import { chartContainerDefaults } from "../../config";
import { ChartHeader, AxisKeys, AxisOptions } from "../../types";
import { ChartCard } from "../ChartCard";
import { BarChartDefaults } from "./Defaults";
import { InternalBarChart } from "./InternalBarChart";
import { cn } from "@/core/utils/style";
import { Global } from "@/core/config";

interface BarChartProps<T> {
  data: T[];
  header: ChartHeader;
  axisKeys: AxisKeys<T>;
  axisOptions?: AxisOptions;
  config?: ChartConfig;
  isEmpty: boolean;
  containerClass?: string;
  cardClass?: string;
  onBarClick?: (item: T) => void;
  activeBar?: any;
}

export const BarChart = memo(<T extends object>({
  data,
  header,
  axisKeys,
  axisOptions,
  isEmpty = false,
  config = {},
  containerClass,
  cardClass,
  onBarClick,
  activeBar,
}: BarChartProps<T>) => {

  return (
    <ChartCard header={header} className={cardClass}>
      {isEmpty ? (
        <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
          {Global.NO_DATA_MESSAGE}
        </div>
      ) : (
        <ChartContainer
          config={config}
          className={cn(chartContainerDefaults.className, containerClass)}
        >
          <InternalBarChart
            data={data}
            margin={BarChartDefaults.margins}
            axisKeys={axisKeys}
            axisOptions={axisOptions}
            config={config}
            onBarClick={onBarClick}
            activeBar={activeBar}
          />
        </ChartContainer>
      )}
    </ChartCard>
  );
}) as <T extends object>(props: BarChartProps<T>) => JSX.Element;
