import { memo, useCallback, useMemo } from "react";
import { Pie, PieChart, PieLabelRenderProps } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/core/components/ui/chart";
import { Lightbulb } from "lucide-react";
import { ChartCard } from "./ChartCard";
import { Spinner } from "@/core/components/ui/spinner";

interface ComparisonPieChartProps {
  data: { name: string; value: number; fill: string }[];
  title: string;
  description?: string;
  valueUnit?: string;
  insight?: string;
  isLoading?: boolean;
}

function ComparisonPieChartComponent({
  data,
  title,
  description,
  valueUnit = "",
  insight,
  isLoading = false
}: ComparisonPieChartProps) {
  const chartConfig = useMemo(() =>
    Object.fromEntries(
      data.map((item) => [item.name, { label: item.name, color: item.fill }])
    ) satisfies ChartConfig, [data]
  );

  const renderLabel = useCallback(
    ({ cx, cy, midAngle, outerRadius, payload }: PieLabelRenderProps) => {
      if (midAngle == null) return null;
      const GAP = 15;
      const RADIAN = Math.PI / 180;
      const radius = outerRadius + GAP;
      const x = cx + radius * Math.cos(-midAngle * RADIAN);
      const y = cy + radius * Math.sin(-midAngle * RADIAN);
      return (
        <text
          x={x}
          y={y}
          textAnchor={x > cx ? "start" : "end"}
          dominantBaseline="central"
          fontSize={12}
          fill="var(--foreground)"
        >
          {Number(payload.value).toFixed(2)}
          {valueUnit}
        </text>
      );
    },
    [valueUnit]
  );

  const isEmpty = data.length === 0;

  return (
    <ChartCard
      header={{ title, description }}
      config={chartConfig}
      className="flex flex-col min-h-80 [&>div:nth-child(2)]:justify-start"
    >
      <div className="relative flex flex-col justify-between h-full">
        {isLoading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center rounded-md bg-background/70 backdrop-blur-[2px]">
            <Spinner className="size-4 text-muted-foreground" />
          </div>
        )}

        {isEmpty ? (
          <span className="text-muted-foreground text-sm">No data</span>
        ) : (
          <>
            <ChartContainer
              config={chartConfig}
              className="mx-auto aspect-square max-h-100 w-full"
            >
              <PieChart>
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="name"
                  outerRadius="55%"
                  strokeWidth={3}
                  isAnimationActive
                  animationDuration={600}
                  labelLine={false}
                  label={renderLabel}
                />
                <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
              </PieChart>
            </ChartContainer>
            {insight && (
              <div className="flex items-start gap-2 text-2xs md:text-xs text-muted-foreground">
                <Lightbulb className="w-3 h-3 md:w-4 md:h-4 mt-0.5 shrink-0" />
                <p className="max-w-full wrap-break-word">{insight}</p>
              </div>
            )}
          </>
        )}
      </div>
    </ChartCard>
  );
}

export const ComparisonPieChart = memo(ComparisonPieChartComponent);
