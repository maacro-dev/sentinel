import { memo, JSX } from "react";
import { ChartConfig, ChartContainer } from "@/core/components/ui/chart";
import { chartContainerDefaults } from "../../config";
import { ChartHeader } from "../../types";
import { ChartCard } from "../ChartCard";
import { InternalRadialChart } from "./InternalRadialChart";
import { cn } from "@/core/utils/style";
import { Global } from "@/core/config";

interface RadialChartProps {
  data: any[];
  header: ChartHeader;
  config?: ChartConfig;
  isEmpty: boolean;
  containerClass?: string;
  cardClass?: string;
  children?: React.ReactNode;
  chartProps?: Omit<React.ComponentProps<typeof InternalRadialChart>, 'data'>;
}

export const RadialChart = memo(({
  data,
  header,
  config = {},
  isEmpty = false,
  containerClass,
  cardClass,
  children,
  chartProps,
}: RadialChartProps) => {
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
          <InternalRadialChart data={data} {...chartProps}>
            {children}
          </InternalRadialChart>
        </ChartContainer>
      )}
    </ChartCard>
  );
}) as (props: RadialChartProps) => JSX.Element;
