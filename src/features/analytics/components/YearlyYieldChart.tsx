import { LineChart, Line, XAxis, YAxis, CartesianGrid, ReferenceLine } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/core/components/ui/chart';
import { cn } from '@/core/utils/style';
import { ChartCard } from './ChartCard';
import { chartContainerDefaults } from '../config';
import { TrendChartDefaults } from './TrendChart/Defaults';
import { useMemo } from 'react';

export interface YearlyDataPoint {
  year: string;
  predicted?: number;
  actual?: number;
  extrapolated?: number;
}

interface YearlyYieldChartProps {
  predictedData: YearlyDataPoint[];
  actualData: YearlyDataPoint[];
  extrapolatedData: YearlyDataPoint[];
  showActual?: boolean;
  isEmpty?: boolean;
  title?: string;
  description?: string;
}

const chartConfig = {
  predicted: { label: 'Predicted Yield', color: 'var(--color-humay)' },
  actual: { label: 'Actual Yield', color: 'var(--color-humay-light)' },
  extrapolated: { label: 'Extrapolated Predicted Yield', color: '#FFA500' },
};

export function YearlyYieldChart({
  predictedData,
  actualData,
  extrapolatedData,
  showActual = false,
  isEmpty = false,
  title = 'Total Yield per Season',
  description = 'Predicted vs actual yields across seasons',
}: YearlyYieldChartProps) {
  const height = 360;

  let transitionYear: string | null = null;

  const chartData = useMemo(() => {
    const dataMap = new Map<string, YearlyDataPoint>();

    predictedData.forEach(d => {
      dataMap.set(d.year, { ...dataMap.get(d.year), year: d.year, predicted: d.predicted });
    });

    actualData.forEach(d => {
      dataMap.set(d.year, { ...dataMap.get(d.year), year: d.year, actual: d.actual });
    });

    extrapolatedData.forEach(d => {
      dataMap.set(d.year, { ...dataMap.get(d.year), year: d.year, extrapolated: d.extrapolated });
    });

    // Find last historical year with a valid predicted or actual value
    let lastHistoricalYear: string | null = null;
    let lastHistoricalValue: number | null = null;

    for (const point of predictedData) {
      if (point.predicted !== undefined && point.predicted > 0) {
        if (!lastHistoricalYear || point.year > lastHistoricalYear) {
          lastHistoricalYear = point.year;
          lastHistoricalValue = point.predicted;
        }
      }
    }
    for (const point of actualData) {
      if (point.actual !== undefined && point.actual > 0) {
        if (!lastHistoricalYear || point.year > lastHistoricalYear) {
          lastHistoricalYear = point.year;
          lastHistoricalValue = point.actual;
        }
      }
    }

    // Find first extrapolated year
    let firstExtrapolatedYear: string | null = null;
    for (const point of extrapolatedData) {
      if (point.extrapolated !== undefined && point.extrapolated !== null) {
        if (!firstExtrapolatedYear || point.year < firstExtrapolatedYear) {
          firstExtrapolatedYear = point.year;
        }
      }
    }

    // Bridge the gap: add a dummy extrapolated point at the last historical year
    if (lastHistoricalYear && lastHistoricalValue !== null && firstExtrapolatedYear) {
      transitionYear = lastHistoricalYear; // store for vertical line
      const existingPoint = dataMap.get(lastHistoricalYear);
      if (!existingPoint || existingPoint.extrapolated === undefined) {
        if (existingPoint) {
          existingPoint.extrapolated = lastHistoricalValue;
        } else {
          dataMap.set(lastHistoricalYear, {
            year: lastHistoricalYear,
            extrapolated: lastHistoricalValue,
          });
        }
      }
    }

    return Array.from(dataMap.values()).sort((a, b) => {
      const aStart = parseInt(a.year.split('-')[0], 10);
      const bStart = parseInt(b.year.split('-')[0], 10);
      return aStart - bStart;
    });
  }, [predictedData, actualData, extrapolatedData]);

  // Compute Y-axis domain based on actual data range
  const yAxisDomain = useMemo(() => {
    const allValues: number[] = [];
    chartData.forEach(point => {
      if (point.predicted !== undefined && point.predicted !== null) allValues.push(point.predicted);
      if (point.actual !== undefined && point.actual !== null) allValues.push(point.actual);
      if (point.extrapolated !== undefined && point.extrapolated !== null) allValues.push(point.extrapolated);
    });

    if (allValues.length === 0) return [0, 100]; // fallback

    let minVal = Math.min(...allValues);
    let maxVal = Math.max(...allValues);

    const range = maxVal - minVal;
    const padding = Math.max(range * 0.1, 0.5);
    let domainMin = minVal - padding;
    let domainMax = maxVal + padding;

    if (domainMin < 0 && minVal >= 0) domainMin = 0;

    return [domainMin, domainMax];
  }, [chartData]);

  const hasActual = showActual && actualData.length > 0 && actualData.some(d => d.actual !== undefined && d.actual > 0);
  const hasExtrapolated = extrapolatedData.length > 0;

  if (isEmpty || chartData.length === 0) {
    return (
      <ChartCard header={{ title, description }} config={chartConfig} className="mt-4">
        <div className="flex items-center justify-center h-90 text-muted-foreground text-sm">
          No data available
        </div>
      </ChartCard>
    );
  }

  return (
    <ChartCard header={{ title, description }} config={chartConfig} className="mt-4">
      <ChartContainer
        config={chartConfig}
        className={cn(chartContainerDefaults.className, "w-full")}
        style={{ height: `${height}px` }}
      >
        <LineChart data={chartData} margin={{ ...TrendChartDefaults.margins, bottom: 40 }}>
          <CartesianGrid vertical={false} strokeDasharray="3 3" />
          <XAxis
            dataKey="year"
            type="category"
            interval={0}
            textAnchor="end"
            height={60}
            {...TrendChartDefaults.axis}
          />
          <YAxis
            {...TrendChartDefaults.axis}
            domain={yAxisDomain}
            tickCount={5}
            tickFormatter={(value) => `${value.toFixed(0)} t/ha`}
          />
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent indicator="line" />}
          />
          {/* Vertical reference line at the transition from historical to extrapolated */}
          {transitionYear && hasExtrapolated && (
            <ReferenceLine
              x={transitionYear}
              stroke="#888"
              strokeDasharray="4 4"
              strokeWidth={1.5}
              label={{ value: 'Forecast start', position: 'top', fill: '#888', fontSize: 12 }}
            />
          )}
          <Line
            type="monotone"
            dataKey="predicted"
            stroke="var(--color-humay)"
            strokeWidth={2}
            dot={{ r: 4, fill: "var(--color-humay)" }}
            connectNulls={false}
            isAnimationActive={true}
            animationDuration={600}
          />
          {hasActual && (
            <Line
              type="monotone"
              dataKey="actual"
              stroke="var(--color-humay-light)"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={{ r: 4, fill: "var(--color-humay-light)" }}
              connectNulls={false}
              isAnimationActive={true}
              animationDuration={600}
            />
          )}
          {hasExtrapolated && (
            <Line
              type="monotone"
              dataKey="extrapolated"
              stroke="#FFA500"
              strokeWidth={2}
              strokeDasharray="6 3"
              dot={{ r: 4, fill: "#FFA500" }}
              connectNulls={false}
              isAnimationActive={true}
              animationDuration={600}
            />
          )}
        </LineChart>
      </ChartContainer>
    </ChartCard>
  );
}
