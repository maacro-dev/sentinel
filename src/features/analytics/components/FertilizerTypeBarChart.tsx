import { memo } from "react";
import { cn } from "@/core/utils/style";
import { GroupedBarChart } from "@/features/analytics/components/GroupedBarChart/GroupedBarChart";
import { TickProps } from "@/features/analytics/types";
import { DefaultTicks } from "@/features/analytics/components/DefaultTicks";
import { FertilizerTypeSummary } from "../schemas/summary/fertilizer-type";

interface FertilizerTypeBarChartProps {
  data: FertilizerTypeSummary;
  activeFertilizer?: string | undefined;
  onFertilizerChange?: (fertilizer: string | undefined) => void;
  onBarHover?: (item: any) => void;
}

export const FertilizerTypeBarChart = memo(
  ({ data, activeFertilizer, onFertilizerChange, onBarHover }: FertilizerTypeBarChartProps) => {
    const chartData = data.ranking.map((item) => ({
      type: item.type,
      count: item.count,
    }));

    const isEmpty = chartData.length === 0 || chartData.every((d) => d.count === 0);

    const nonZeroCount = chartData.filter((d) => d.count > 0).length;
    const chartKey = nonZeroCount > 0 ? `fertilizer-bars-${nonZeroCount}` : 'empty';

    const handleBarClick = (item: any) => {
      if (!onFertilizerChange) return;

      const type = item?.type ?? item?.payload?.type;

      if (type === activeFertilizer) onFertilizerChange(undefined); else onFertilizerChange(type);
    };

    const floatingLabel = activeFertilizer ? "Clear Fertilizer Filter" : null;

    return (
      <div className="relative size-full">
        <div
          className={cn(
            "absolute left-1/2 transform -translate-x-1/2 top-8 z-10 transition-all duration-300 ease-in-out",
            floatingLabel
              ? "opacity-100 translate-y-0"
              : "opacity-0 -translate-y-2 pointer-events-none"
          )}
        >
          <button
            onClick={() => onFertilizerChange?.(undefined)}
            className="bg-muted text-foreground px-4 py-2 rounded-full text-xs shadow-sm hover:bg-accent transition-colors cursor-pointer"
          >
            {floatingLabel}
          </button>
        </div>

        <GroupedBarChart
          key={chartKey}
          data={chartData}
          categoryKey={"type"}
          barKeys={[
            {
              key: "count",
              name: "Applications",
              color: "var(--color-humay)",
            },
          ]}
          header={{
            title: "Fertilizer Usage",
            description: "Number of applications by fertilizer type",
          }}
          isEmpty={isEmpty}
          layout="horizontal"
          cardClass="h-full min-h-120"
          getBarSize={() => 56}
          activeBar={activeFertilizer}
          onBarClick={handleBarClick}
          onBarHover={(item) => onBarHover?.(item)}
          labelFormatter={(value: any) => {
            if (value === 0 || value === "0") return "N/A";
            const num = typeof value === "number" ? value : parseFloat(value);
            if (!isNaN(num) && num !== 0) return Math.round(num).toString();
            return value;
          }}
          axisOptions={{
            X: {
              interval: 0,
              tick: ({ x, y, payload }: TickProps) => (
                <DefaultTicks x={x} y={y} payload={payload} />
              ),
            },
            Y: {
              domain: [0, (dataMax: number) => Math.max(dataMax, 5)],
              allowDecimals: false,
              tickFormatter: (value: number) => Math.round(value).toString(),
            },
          }}
        />
      </div>
    );
  }
);
