import { memo, JSX, ReactNode } from "react";
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
  children?: ReactNode;
  chartProps?: Omit<React.ComponentProps<typeof InternalRadialChart>, 'data'>;
  insight?: ReactNode;  // new prop
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
  insight,
}: RadialChartProps) => {
  return (
    <ChartCard header={header} className={cardClass}>
      {isEmpty ? (
        <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
          {Global.NO_DATA_MESSAGE}
        </div>
      ) : (
        <div className="flex flex-col h-full">
          <ChartContainer config={config} className={cn(chartContainerDefaults.className, containerClass)} >
            <InternalRadialChart data={data} {...chartProps}>
              {children}
            </InternalRadialChart>
          </ChartContainer>
          {insight && (
            <div className="px-2 text-sm text-muted-foreground/75">
              {insight}
            </div>
          )}
        </div>
      )}
    </ChartCard>
  );
}) as (props: RadialChartProps) => JSX.Element;
