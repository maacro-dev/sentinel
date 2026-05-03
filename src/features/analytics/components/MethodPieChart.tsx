import { Pie, PieChart, Label, Cell, Sector, type PieSectorShapeProps } from "recharts";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartConfig,
  ChartTooltip,
} from "@/core/components/ui/chart";
import { Lightbulb } from "lucide-react";
import { CropMethodSummary } from "../schemas/summary/method";
import { BarChartDefaults } from "./BarChart/Defaults";
import { useMemo } from "react";
import { cn } from "@/core/utils/style";
import { ChartCard } from "./ChartCard";

interface MethodPieChartProps {
  summary: CropMethodSummary;
  activeMethod?: string | null;
  onMethodChange?: (method: string | undefined) => void;
  onSliceHover?: (method: string) => void;
}

export function MethodPieChart({
  summary,
  activeMethod,
  onMethodChange,
  onSliceHover,
}: MethodPieChartProps) {
  const { direct_seeded_count, transplanted_count, percent_difference } = summary;
  const total = direct_seeded_count + transplanted_count;

  const chartData = [
    { method: "Direct-seeded", count: direct_seeded_count, fill: "var(--color-humay)" },
    { method: "Transplanted", count: transplanted_count, fill: "var(--color-humay-light)" },
  ];

  const chartConfig = {
    count: { label: "Fields" },
    "Direct-seeded": { label: "Direct‑seeded", color: "var(--color-humay)" },
    "Transplanted": { label: "Transplanted", color: "var(--color-humay-light)" },
  } satisfies ChartConfig;

  const activeIndex = useMemo(() => {
    if (!activeMethod) return -1;
    return chartData.findIndex((d) => d.method === activeMethod);
  }, [activeMethod, chartData]);

  const handlePieClick = (data: any) => {
    if (!onMethodChange) return;
    const method = data?.payload?.method;
    if (method === activeMethod) {
      onMethodChange(undefined);
    } else {
      onMethodChange(method);
    }
  };

  const renderSector = (props: PieSectorShapeProps) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, index, ...rest } = props;
    const isActive = index === activeIndex;
    const adjustedOuterRadius = isActive ? outerRadius + 10 : outerRadius;
    return (
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={adjustedOuterRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        {...rest}
      />
    );
  };

  const dominant = direct_seeded_count > transplanted_count ? "Direct‑seeded" : transplanted_count > direct_seeded_count ? "Transplanted" : "Equal";
  const dominantCount = dominant === "Direct‑seeded" ? direct_seeded_count : dominant === "Transplanted" ? transplanted_count : 0;
  const dominantPercent = total > 0 ? ((dominantCount / total) * 100).toFixed(1) : "0";
  const percentText = dominant === "Equal" ? "Both methods are equally used." : `${Math.abs(percent_difference).toFixed(1)}% more than the other.`;

  const insightContent = (
    <div className="flex items-start gap-2 px-2 pt-2 text-sm text-muted-foreground">
      <Lightbulb className="size-4 mt-0.5 shrink-0" />
      <p>
        {dominant === "Equal" ? (
          <>Both methods are equally used, each on {direct_seeded_count} fields.</>
        ) : (
          <>
            <span className="font-medium text-foreground">{dominant}</span> is the
            most used method (
            <span className="font-medium text-foreground">{dominantCount}</span>{" "}
            fields), {percentText}
          </>
        )}
      </p>
    </div>
  );


  return (
    <ChartCard
      header={{
        title: "Establishment Method",
        description: "Most used method this season (includes fields without yield)",
      }}
      config={chartConfig}
      className="flex flex-col min-h-80 [&>div:nth-child(2)]:justify-start"
    >
      {total === 0 ? (
        <span className="text-muted-foreground text-sm">No data</span>
      ) : (
        <>
          <ChartContainer config={chartConfig} className="mx-auto aspect-square max-h-60 w-full">
            <PieChart>
              <Pie
                data={chartData}
                dataKey="count"
                nameKey="method"
                innerRadius={60}
                outerRadius={80}
                shape={renderSector}
                onClick={handlePieClick}
                cursor="pointer"
                isAnimationActive
                animationDuration={500}
                onMouseEnter={(data) => {
                  if (onSliceHover && data?.payload?.method) {
                    onSliceHover(data.payload.method);
                  }
                }}
              >
                {chartData.map((entry, index) => {
                  const isActive = index === activeIndex;
                  return (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.fill}
                      className={cn(
                        "origin-center transition-transform duration-150 ease-out",
                        isActive ? "" : "hover:scale-105"
                      )}
                    />
                  );
                })}
                <Label
                  position="center"
                  content={({ viewBox }: any) => {
                    if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                      return (
                        <text
                          x={viewBox.cx}
                          y={viewBox.cy}
                          textAnchor="middle"
                          dominantBaseline="middle"
                        >
                          <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy || 0) - 12}
                            className="fill-foreground text-2xl font-semibold"
                          >
                            {dominantPercent}%
                          </tspan>
                          <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy || 0) + 12}
                            className="fill-muted-foreground text-xs"
                          >
                            of fields
                          </tspan>
                        </text>
                      );
                    }
                    return null;
                  }}
                />
              </Pie>
              <ChartTooltip {...BarChartDefaults.tooltip} />
              <ChartLegend
                content={({ payload }) => (
                  <ChartLegendContent nameKey="method" payload={payload} className="text-sm" />
                )}
              />
            </PieChart>
          </ChartContainer>
          {insightContent}
        </>
      )}
    </ChartCard>
  );
}
