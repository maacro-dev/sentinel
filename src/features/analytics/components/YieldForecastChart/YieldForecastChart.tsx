import { LineChart, Line, XAxis, YAxis, CartesianGrid, ReferenceLine } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/core/components/ui/chart';
import { ChartCard } from '../ChartCard';
import { chartContainerDefaults } from '../../config';
import { cn } from '@/core/utils/style';
import { useMemo } from 'react';
import { TrendChartDefaults } from '../TrendChart/Defaults';

const getMonthIndex = (abbr: string): number => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return months.indexOf(abbr);
};

interface ChartDataPoint {
  month: string;
  predicted?: number;
  actual?: number;
  extrapolated?: number;
  combinedSolid?: number;
  combinedDashed?: number;
  fullDate: Date;
}

interface YieldForecastChartProps {
  predicted: Array<{ month: string; avg_yield_per_field: number }>;
  actual: Array<{ month: string; avg_yield_per_field: number }>;
  extrapolated: Array<{ month: string; avg_yield_per_field: number }>;
  harvestOrder: string[];
  title?: string;
  description?: string;
  containerClass?: string;
  cardClass?: string;
  isEmpty?: boolean;
}

const chartConfig = {
  combinedSolid: { label: 'Predicted', color: 'var(--color-humay)' },
  combinedDashed: { label: 'Next Season Prediction', color: '#FFA500' },
  actual: { label: 'Actual', color: 'var(--color-humay-light)' },
};

export function YieldForecastChart({
  predicted,
  actual,
  extrapolated,
  harvestOrder,
  title,
  description,
  containerClass,
  cardClass,
  isEmpty = false,
}: YieldForecastChartProps) {

  const chartData = useMemo(() => {

    const monthMap = new Map<string, ChartDataPoint>();
    const harvestMonthSet = new Set(harvestOrder);


    const parseMonth = (monthStr: string) => {
      const [mon, yearStr] = monthStr.split(' ');
      return { monthAbbr: mon, year: parseInt(yearStr, 10) };
    };

    const isHarvestMonth = (monthStr: string) => {
      const [mon] = monthStr.split(' ');
      return harvestMonthSet.has(mon);
    };

    predicted.filter(p => isHarvestMonth(p.month)).forEach(p => {
      const { monthAbbr, year } = parseMonth(p.month);
      monthMap.set(p.month, {
        month: monthAbbr,
        predicted: p.avg_yield_per_field,
        fullDate: new Date(year, getMonthIndex(monthAbbr), 1),
      });
    });

    actual.filter(a => isHarvestMonth(a.month)).forEach(a => {
      const { monthAbbr, year } = parseMonth(a.month);
      const existing = monthMap.get(a.month);
      if (existing) {
        existing.actual = a.avg_yield_per_field;
      } else {
        monthMap.set(a.month, {
          month: monthAbbr,
          actual: a.avg_yield_per_field,
          fullDate: new Date(year, getMonthIndex(monthAbbr), 1),
        });
      }
    });

    extrapolated.filter(e => isHarvestMonth(e.month)).forEach(e => {
      const { monthAbbr, year } = parseMonth(e.month);
      const existing = monthMap.get(e.month);
      if (existing) {
        existing.extrapolated = e.avg_yield_per_field;
      } else {
        monthMap.set(e.month, {
          month: monthAbbr,
          extrapolated: e.avg_yield_per_field,
          fullDate: new Date(year, getMonthIndex(monthAbbr), 1),
        });
      }
    });

    const months = Array.from(monthMap.values());
    months.sort((a, b) => {
      if (a.fullDate.getFullYear() !== b.fullDate.getFullYear())
        return a.fullDate.getFullYear() - b.fullDate.getFullYear();
      return a.fullDate.getMonth() - b.fullDate.getMonth();
    });

    const lastPredictedIdx = months.reduce((last, p, i) => p.predicted !== undefined ? i : last, -1);

    return months.map((point, i) => {
      if (i === lastPredictedIdx) {
        return { ...point, combinedSolid: point.predicted, combinedDashed: point.predicted };
      }
      if (i < lastPredictedIdx) {
        return { ...point, combinedSolid: point.predicted };
      }
      return { ...point, combinedDashed: point.extrapolated };
    });
  }, [predicted, actual, extrapolated, harvestOrder]);

  const handoffMonth = chartData.find(p => p.combinedSolid !== undefined && p.combinedDashed !== undefined)?.month;

  const height = 360

  return (
    <ChartCard
      className={cardClass}
      header={{ title: title ?? 'Yield Forecast', description: description ?? 'Predicted vs Actual vs Extrapolated' }}
      config={chartConfig}
    >
      {isEmpty ? (
        <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
          No data available
        </div>
      ) : (
        <ChartContainer
          config={chartConfig}
          className={cn(
            chartContainerDefaults.className,
            "w-full",
            containerClass,
            height ? `h-[${height}px]` : ""
          )}
          style={height ? { height: `${height}px` } : undefined}
        >
          <LineChart data={chartData} margin={TrendChartDefaults.margins} accessibilityLayer>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="month"
              type="category"
              ticks={harvestOrder}
              allowDuplicatedCategory={false}
              {...TrendChartDefaults.axis}
            />
            <YAxis {...TrendChartDefaults.axis} tickCount={4} />
            {handoffMonth && (
              <ReferenceLine
                x={handoffMonth}
                stroke="var(--color-humay)"
                strokeDasharray="4 4"
                strokeWidth={1.5}
              />
            )}
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="line" color="var(--color-humay)" />}
            />
            {/* Predicted line (solid) */}
            <Line
              type="monotone"
              dataKey="combinedSolid"
              stroke="var(--color-humay)"
              strokeWidth={2}
              dot={({ cx, cy, payload }: any) =>
                payload.predicted !== undefined ? (
                  <circle key={cx} cx={cx} cy={cy} r={4} fill="var(--color-humay)" />
                ) : (
                  <g key={cx} />
                )
              }
              name="Predicted"
              connectNulls
              isAnimationActive={true}
              animationDuration={600}
            />
            {/* Actual line (dashed, lighter) */}
            <Line
              type="monotone"
              dataKey="actual"
              stroke="var(--color-humay-3)"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={{ r: 4 }}
              name="Actual"
              connectNulls
              isAnimationActive={true}
              animationDuration={600}
            />
            {/* Extrapolated line (orange dashed) */}
            <Line
              type="monotone"
              dataKey="combinedDashed"
              stroke="#FFA500"
              strokeWidth={2}
              strokeDasharray="6 3"
              dot={({ cx, cy, payload }: any) =>
                payload.extrapolated !== undefined ? (
                  <circle key={cx} cx={cx} cy={cy} r={4} fill="#FFA500" />
                ) : (
                  <g key={cx} />
                )
              }
              name="Next Season Prediction"
              connectNulls
              isAnimationActive={true}
              animationDuration={600}
            />
          </LineChart>
        </ChartContainer>
      )}
    </ChartCard>
  );
}
