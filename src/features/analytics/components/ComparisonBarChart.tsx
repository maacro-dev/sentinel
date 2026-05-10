// components/ComparisonBarChart.tsx
import { memo, useMemo } from "react";
import {
  BarChart,
  Bar,
  YAxis,
  CartesianGrid,
  Cell,
  LabelList,
  Rectangle,
  XAxis,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/core/components/ui/chart";
import { Lightbulb } from "lucide-react";
import { ChartCard } from "./ChartCard";
import { Spinner } from "@/core/components/ui/spinner";
import { BarChartDefaults } from "@/features/analytics/components/BarChart/Defaults";

interface ComparisonBarChartProps {
  data: { name: string; value: number; fill: string }[];
  title: string;
  description?: string;
  valueUnit?: string;
  insight?: string;
  isLoading?: boolean;
}

const ZeroAwareBar = memo((props: any) => {
  const { x, y, width, height, value, fill } = props;
  if (value === 0 || value == null) {
    return (
      <Rectangle
        x={x}
        y={y}
        width={4}
        height={height}
        fill={fill}
        opacity={0.25}
        radius={2}
      />
    );
  }
  return <Rectangle {...props} x={x} y={y} width={width} height={height} fill={fill} />;
});

const CustomLegend = memo(({ payload }: { payload?: { name: string; fill: string }[] }) => {
  if (!payload?.length) return null;
  return (
  <div className="grid grid-cols-2 gap-x-4 gap-y-1 pt-4 pb-1 w-full pl-4">
      {payload.map((entry, index) => (
        <div key={`legend-${index}`} className="flex items-center gap-1.5">
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              backgroundColor: entry.fill,
            }}
          />
          <span className="text-xs text-foreground">{entry.name}</span>
        </div>
      ))}
    </div>
  );
});

const ComparisonBarChartComponent = memo(
  ({
    data,
    title,
    description,
    valueUnit = "t/ha",
    insight,
    isLoading = false,
  }: ComparisonBarChartProps) => {
    const chartConfig = useMemo(
      () =>
        Object.fromEntries(
          data.map((item) => [item.name, { label: item.name, color: item.fill }])
        ),
      [data]
    );

    const margins = useMemo(
      () => ({ left: -30, right: 20, top: 40, bottom: 0 }),
      []
    );

    const formattedData = useMemo(
      () =>
        data.map((d) => ({
          ...d,
          formattedValue:
            d.value === 0 ? "N/A" : `${d.value.toFixed(2)} ${valueUnit}`,
        })),
      [data, valueUnit]
    );

    const legendPayload = useMemo(
      () => data.map((d) => ({ name: d.name, fill: d.fill })),
      [data]
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
                className="mx-auto w-full"
                style={{ height: 180 }}  // reduced height because no X labels
              >
                <BarChart
                  data={formattedData}
                  layout="horizontal"
                  margin={margins}
                  {...BarChartDefaults.barChart}
                >
                  <CartesianGrid
                    vertical={false}
                    horizontal={true}
                    strokeDasharray="3 3"
                  />
                  {/* Y axis with numeric labels */}
                  <YAxis
                    type="number"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 12 }}
                    tickFormatter={(val: number) =>
                      val === 0 ? "N/A" : val.toFixed(1)
                    }
                    width={60}
                  />
                  {/* Invisible X axis – just for bar positioning, no labels */}
                  <XAxis
                    dataKey="name"
                    type="category"
                    tick={false}
                    axisLine={false}
                    height={0}
                  />
                  <ChartTooltip
                    content={<ChartTooltipContent />}
                    cursor={{ fill: "transparent" }}
                  />
                  <Bar
                    dataKey="value"
                    barSize={28}
                    radius={[4, 4, 0, 0]}
                    shape={(props: any) => <ZeroAwareBar {...props} />}
                    isAnimationActive
                    animationDuration={600}
                  >
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                    <LabelList
                      dataKey="formattedValue"
                      position="top"
                      fontSize={12}
                      offset={6}
                      className="fill-foreground"
                    />
                  </Bar>
                </BarChart>
              </ChartContainer>

              {/* Custom legend */}
              <CustomLegend payload={legendPayload} />

              {insight && (
                <div className="flex items-start gap-2 text-2xs md:text-xs text-muted-foreground mt-2">
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
);

export const ComparisonBarChart = memo(ComparisonBarChartComponent);
