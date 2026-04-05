
// @ts-nocheck
import { JSX, memo } from "react";
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, LabelList } from "recharts";
import { ChartCard, ChartCardProps } from "../ChartCard";
import { ChartContainer, ChartTooltip } from "@/core/components/ui/chart";
import { cn } from "@/core/utils/style";
import { Global } from "@/core/config";
import { chartContainerDefaults } from "../../config";
import { AxisOptions, ChartHeader } from "../../types";
import { BarChartDefaults } from "../BarChart/Defaults";

interface GroupedBarChartProps<T> {
  data: T[];
  header: ChartHeader;
  categoryKey: keyof T;
  barKeys: Array<{ key: keyof T; name: string; color: string }>;
  isEmpty?: boolean;
  containerClass?: string;
  cardClass?: string;
  layout?: "vertical" | "horizontal";
  options?: ChartCardProps['options'];
  axisOptions?: {
    x?: AxisOptions;
    y?: AxisOptions;
  };
  onBarClick?: (item: any) => void;
  valueUnit?: string;
}

const renderLegend = (props: any) => {
  const { payload } = props;
  if (!payload) return null;
  return (
    <div className="flex justify-center gap-4 pt-2 pb-1">
      {payload.map((entry: any, index: number) => (
        <div key={`legend-${index}`} className="flex items-center gap-1.5">
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              backgroundColor: entry.color,
            }}
          />
          <span className="text-xs text-foreground">{entry.value}</span>
        </div>
      ))}
    </div>
  );
};

export const GroupedBarChart = memo(<T extends object>({
  data,
  header,
  categoryKey,
  barKeys,
  isEmpty = false,
  containerClass,
  cardClass,
  layout = "vertical",
  options,
  axisOptions,
  onBarClick,
  valueUnit = ""
}: GroupedBarChartProps<T>) => {
  const isVertical = layout === "vertical";

  const config = barKeys.reduce((acc, { key, name, color }) => {
    acc[key as string] = { label: name, color };
    return acc;
  }, {} as Record<string, { label: string; color: string }>);

  const margins = isVertical
    ? { ...BarChartDefaults.margins, left: 60, right: 80, bottom: 20, top: 20 }
    : { ...BarChartDefaults.margins, bottom: 80, left: 40, top: 20, right: 20 };

  const xAxisType = isVertical ? "number" : "category";
  const yAxisType = isVertical ? "category" : "number";
  const dataKeyX = isVertical ? undefined : categoryKey as string;
  const dataKeyY = isVertical ? categoryKey as string : undefined;

  const labelPosition = isVertical ? "right" : "top";

  const barsPerCategory = barKeys.length;
  const heightPerCategory = barsPerCategory === 1 ? 75 : 100;

  const minHeight = 300;
  const explicitHeight = isVertical ? Math.max(minHeight, data.length * heightPerCategory) : undefined;

  const containerStyle = isVertical ? { height: explicitHeight } : undefined;

  const containerClassName = cn(
    !isVertical && chartContainerDefaults.className,
    containerClass,
    'w-full'
  );

  return (
    <ChartCard
      header={header}
      className={cn(cardClass)}
      options={options}
      config={config}
    >
      {isEmpty ? (
        <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
          {Global.NO_DATA_MESSAGE}
        </div>
      ) : (
        <ChartContainer
          config={config}
          className={containerClassName}
          style={containerStyle}
        >
          <RechartsBarChart
            data={data}
            layout={layout}
            {...BarChartDefaults.barChart}
            margin={margins}
            barCategoryGap="60%"
          >
            <CartesianGrid
              vertical={isVertical}
              horizontal={!isVertical}
              strokeDasharray="3 3"
            />
            <XAxis
              type={xAxisType}
              dataKey={dataKeyX}
              {...BarChartDefaults.axis}
              {...axisOptions?.x}
              tickMargin={20}
            />
            <YAxis
              type={yAxisType}
              dataKey={dataKeyY}
              width={isVertical ? 100 : undefined}
              {...BarChartDefaults.axis}
              {...axisOptions?.y}
            />
            {barKeys.length > 1 && (
              <Legend verticalAlign="top" height={40} wrapperStyle={{ paddingBottom: 40 }} content={renderLegend} />
            )}
            <ChartTooltip {...BarChartDefaults.tooltip} />
            {barKeys.map(({ key, name, color }) => (
              <Bar
                key={key as string}
                dataKey={key as string}
                name={name}
                fill={color}
                barSize={24}
                radius={BarChartDefaults.bar.radius as [number, number, number, number]}
                isAnimationActive={true}
                animationDuration={BarChartDefaults.barChart.animationDuration}
                onClick={onBarClick}
                cursor={onBarClick ? "pointer" : "default"}
              >
                <LabelList
                  dataKey={key as string}
                  position={labelPosition}
                  offset={16}
                  className="fill-foreground"
                  fontSize={14}
                  formatter={(value: any) => {
                    if (value === 0 || value === "0") return "N/A";
                    const num = typeof value === "number" ? value : parseFloat(value);
                    if (!isNaN(num) && num !== 0) return `${num.toFixed(2)} ${valueUnit}`;
                    return value;
                  }}
                />
              </Bar>
            ))}
          </RechartsBarChart>
        </ChartContainer>
      )}
    </ChartCard>
  );
}) as <T extends object>(props: GroupedBarChartProps<T>) => JSX.Element;
