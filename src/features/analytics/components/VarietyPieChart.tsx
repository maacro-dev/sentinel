import { Pie, PieChart, Label, Cell, Sector, PieSectorShapeProps } from "recharts";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartConfig,
  ChartTooltip,
} from "@/core/components/ui/chart";
import { Lightbulb } from "lucide-react";
import { RiceVarietySummary } from "../schemas/summary/variety";
import { BarChartDefaults } from "./BarChart/Defaults";
import { useMemo } from "react";
import { cn } from "@/core/utils/style";
import { ChartCard } from "./ChartCard";

interface VarietyPieChartProps {
  summary: RiceVarietySummary;
  activeVariety?: string | null;
  onVarietyChange?: (variety: string | undefined) => void;
  onSliceHover?: (variety: string) => void;
}

export function VarietyPieChart({
  summary,
  activeVariety,
  onVarietyChange,
  onSliceHover,
}: VarietyPieChartProps) {
  const {
    nsic_count,
    psb_count,
    other_count,
    total,
    dominant,
    percent_difference,
  } = summary;

  const chartData = [
    { variety: "NSIC", count: nsic_count, fill: "var(--color-humay)" },
    { variety: "PSB", count: psb_count, fill: "var(--color-humay-4)" },
    { variety: "Others", count: other_count, fill: "var(--color-humay-light)" },
  ];

  const chartConfig = {
    count: { label: "Fields" },
    NSIC: { label: "NSIC", color: "var(--color-humay)" },
    PSB: { label: "PSB", color: "var(--color-humay-4)" },
    Others: { label: "Others", color: "var(--color-humay-light)" },
  } satisfies ChartConfig;

  const activeIndex = useMemo(() => {
    if (!activeVariety) return -1;
    return chartData.findIndex((d) => d.variety === activeVariety);
  }, [activeVariety, chartData]);

  const handlePieClick = (data: any) => {
    if (!onVarietyChange) return;
    const variety = data?.payload?.variety;
    if (variety === activeVariety) {
      onVarietyChange(undefined);
    } else {
      onVarietyChange(variety);
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

  let dominantLabel: string;
  let dominantCount: number;
  let otherLabel: string;

  if (dominant === "NSIC") {
    dominantLabel = "NSIC";
    dominantCount = nsic_count;
    otherLabel = psb_count >= other_count ? "PSB" : "Others";
  } else if (dominant === "PSB") {
    dominantLabel = "PSB";
    dominantCount = psb_count;
    otherLabel = nsic_count >= other_count ? "NSIC" : "Others";
  } else if (dominant === "Others") {
    dominantLabel = "Others";
    dominantCount = other_count;
    otherLabel = nsic_count >= psb_count ? "NSIC" : "PSB";
  } else {
    dominantLabel = "None";
    dominantCount = 0;
    otherLabel = "";
  }

  const dominantPercent = total > 0 ? ((dominantCount / total) * 100).toFixed(1) : "0";

  const percentText = percent_difference > 0
    ? `${percent_difference.toFixed(1)}% more than ${otherLabel}`
    : "Only one variety used";

  const insightContent = (
    <div className="flex items-start gap-2 px-2 pt-2 text-sm text-muted-foreground">
      <Lightbulb className="size-4 mt-0.5 shrink-0" />
      <p>
        {dominantLabel === "None" ? (
          <>No clear dominant variety.</>
        ) : percent_difference > 0 ? (
          <>
            <span className="font-medium text-foreground">{dominantLabel}</span> is
            the most used variety (
            <span className="font-medium text-foreground">{dominantCount}</span>{" "}
            fields), {percentText}
          </>
        ) : (
          <>
            Only{" "}
            <span className="font-medium text-foreground">{dominantLabel}</span>{" "}
            used.
          </>
        )}
      </p>
    </div>
  );

  return (
    <ChartCard
      header={{ title: "Rice Variety", description: "Most used variety this season", }}
      config={chartConfig}
      className="flex flex-col min-h-80 [&>div:nth-child(2)]:justify-start"
    >
      {total === 0 ? (
        <span className="text-muted-foreground text-sm">No data</span>
      ) : (
        <>
          <ChartContainer
            config={chartConfig}
            className="mx-auto aspect-square max-h-60 w-full"
          >
            <PieChart>
              <Pie
                data={chartData}
                dataKey="count"
                nameKey="variety"
                innerRadius={60}
                outerRadius={80}
                shape={renderSector}
                onClick={handlePieClick}
                cursor="pointer"
                isAnimationActive
                animationDuration={500}
                onMouseEnter={(data) => {
                  if (onSliceHover && data?.payload?.variety) {
                    onSliceHover(data.payload.variety);
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
                  <ChartLegendContent
                    nameKey="variety"
                    payload={payload}
                    className="text-sm"
                  />
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
