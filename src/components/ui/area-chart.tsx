import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { cn } from "@/lib/utils";
import { useCallback } from "react";

type AreaChartDefaultProps = {
  data: any;
  xDataKey: string;
  yDataKey: string;
  title: string;
  description: string;
  config?: ChartConfig;
  className?: string;
};

export function AreaChartDefault({
  data,
  xDataKey,
  yDataKey,
  title,
  description,
  config = {},
  className,
}: AreaChartDefaultProps) {
  const dataLength = data.length;

  const formatTick = useCallback((value: any) => {
    if (typeof value === "number") {
      return Number(value.toFixed(2));
    }
    if (value instanceof Date) {
      return value.toLocaleDateString();
    }
    return value.toString().substring(0, 10);
  }, []);

  return (
    <Card className="shadow-none">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold">{title}</CardTitle>
        <CardDescription className="text-sm">{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={config} className={cn("min-h-[300px] w-full", className)}>
          <AreaChart data={data} margin={{ top: 40, right: 60, left: 0, bottom: 60 }} accessibilityLayer>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey={xDataKey}
              type="category"
              interval={0}
              tickLine={false}
              axisLine={false}
              tickMargin={40}
              tickFormatter={formatTick}
            />

            <YAxis
              tickFormatter={formatTick}
              tickLine={false}
              axisLine={false}
              tickMargin={40}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  label={config.label}
                  indicator="line"
                  className="p-2"
                />
              }
            />
            <Area
              dataKey={yDataKey}
              type="monotone"
              stroke="var(--color-humay)"
              fill="var(--color-humay-light)"
              dot={dataLength > 50 ? false : { r: 4 }}
              activeDot={{ r: 6 }}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>//
  );
}
