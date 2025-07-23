import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/core/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/core/components/ui/chart";
import { cn } from "@/core/utils/style";

type AreaChartDefaultProps = {
  data: any;
  xDataKey: string;
  yDataKey: string;
  title: string;
  description: string;
  config: ChartConfig;
  className?: string;
};

export function AreaChartDefault({
  data,
  xDataKey,
  yDataKey,
  title,
  description,
  config,
  className,
}: AreaChartDefaultProps) {
  return (
    <Card className="shadow-none bg-transparent">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">{title}</CardTitle>
        <CardDescription className="text-sm text-muted-foreground/75">{description}</CardDescription>
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
            />
            <YAxis
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
              fill="var(--color-green-100)"
              dot={data.length > 50 ? false : { r: 4 }}
              activeDot={{ r: 6 }}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>//
  );
}
