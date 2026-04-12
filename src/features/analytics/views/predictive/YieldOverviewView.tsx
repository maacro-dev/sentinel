// @ts-nocheck

import { useYearlyYieldOverview } from '../../hooks/useYearlyYieldOverview';
import { Lightbulb } from 'lucide-react';
import { useMemo } from 'react';
import { YearlyDataPoint, YearlyYieldChart } from '../../components/YearlyYieldChart';
import { useCurrentSeason } from '@/features/fields/hooks/useSeasons';

export function YearlyOverviewView() {
  const { data, isLoading } = useYearlyYieldOverview();
  const { selected: currentSeason } = useCurrentSeason();

  const currentStartYear = useMemo(() => {
    if (!currentSeason?.season_year) return null;
    return parseInt(currentSeason.season_year.split('-')[0], 10);
  }, [currentSeason]);

  // Data to display in the chart (only the current season if it's a range, or all seasons up to current)
  const realData = useMemo(() => {
    if (!currentStartYear) return data.filter(d => d.totalPredicted > 0);
    const isRangeSeason = currentSeason?.season_year?.includes('-');
    if (isRangeSeason) {
      // For a range season (e.g., "2021-2022"), show only that exact season in the chart
      return data.filter(d => d.year === currentSeason.season_year && d.totalPredicted > 0);
    }
    // For a single-year season, show all seasons up to that year
    return data
      .filter(d => {
        const seasonStartYear = parseInt(d.year.split('-')[0], 10);
        return seasonStartYear <= currentStartYear && d.totalPredicted > 0;
      })
      .sort((a, b) => {
        const aYear = parseInt(a.year.split('-')[0], 10);
        const bYear = parseInt(b.year.split('-')[0], 10);
        return aYear - bYear;
      });
  }, [data, currentStartYear, currentSeason]);

  // Historical data for extrapolation (includes ALL seasons up to current start year, even if not shown)
  const historicalData = useMemo(() => {
    if (!currentStartYear) return [];
    return data
      .filter(d => {
        const seasonStartYear = parseInt(d.year.split('-')[0], 10);
        return seasonStartYear <= currentStartYear && d.totalPredicted > 0;
      })
      .sort((a, b) => {
        const aYear = parseInt(a.year.split('-')[0], 10);
        const bYear = parseInt(b.year.split('-')[0], 10);
        return aYear - bYear;
      });
  }, [data, currentStartYear]);

  const realDataMap = useMemo(() => new Map(realData.map(d => [d.year, d])), [realData]);

  // --- Improved extrapolation using ALL historical points (including hidden ones) ---
  const extrapolatedData = useMemo(() => {
    if (historicalData.length === 0) return [];

    // Extract numeric points for regression (use ALL historical points)
    const points = historicalData.map(d => ({
      x: parseInt(d.year.split('-')[0], 10),
      y: d.totalPredicted,
    }));

    let futureYields: number[] = [];
    const lastYear = Math.max(...points.map(p => p.x));

    if (points.length === 1) {
      // Only one data point: flat extrapolation (no growth)
      const lastYield = points[0].y;
      futureYields = [lastYield, lastYield];
    } else {
      // Two or more points: linear regression on all points
      const regression = linearRegression(points);
      if (regression) {
        const years = [lastYear + 1, lastYear + 2];
        futureYields = years.map(year => Math.max(0, regression.slope * year + regression.intercept));
      } else {
        // Fallback: use average change from last two points if regression fails
        const lastTwo = points.slice(-2);
        const avgChange = (lastTwo[1].y - lastTwo[0].y) / lastTwo[0].y;
        const lastYield = lastTwo[1].y;
        futureYields = [lastYield * (1 + avgChange), lastYield * (1 + avgChange * 2)];
      }
    }

    const extrapolatedPoints: YearlyDataPoint[] = [];

    for (let i = 0; i < futureYields.length; i++) {
      const yearNum = lastYear + i + 1;
      extrapolatedPoints.push({
        year: `${yearNum}`,
        totalPredictedExtrapolated: futureYields[i],
      });
      extrapolatedPoints.push({
        year: `${yearNum}-${yearNum + 1}`,
        totalPredictedExtrapolated: futureYields[i],
      });
    }

    // Remove duplicate years (if any)
    const seen = new Set();
    return extrapolatedPoints.filter(p => {
      if (seen.has(p.year)) return false;
      seen.add(p.year);
      return true;
    });
  }, [historicalData]);

  const fullYearRange = useMemo(() => {
    if (realData.length === 0) return { min: 0, max: 0 };

    let minStart = Infinity;
    let maxEnd = -Infinity;

    realData.forEach(d => {
      const start = parseInt(d.year.split('-')[0], 10);
      const end = d.year.includes('-') ? parseInt(d.year.split('-')[1], 10) : start;
      minStart = Math.min(minStart, start);
      maxEnd = Math.max(maxEnd, end);
    });

    extrapolatedData.forEach(d => {
      const end = parseInt(d.year.split('-')[1], 10);
      maxEnd = Math.max(maxEnd, end);
    });

    return { min: minStart, max: maxEnd };
  }, [realData, extrapolatedData]);

  const expandedDataForChart = useMemo(() => {
    if (fullYearRange.min === 0) return [];

    const expanded: YearlyDataPoint[] = [];
    for (let y = fullYearRange.min; y <= fullYearRange.max; y++) {
      const singleLabel = `${y}`;
      if (realDataMap.has(singleLabel)) {
        expanded.push(realDataMap.get(singleLabel)!);
      } else {
        expanded.push({ year: singleLabel, totalPredicted: undefined, totalActual: undefined });
      }
      if (y < fullYearRange.max) {
        const rangeLabel = `${y}-${y + 1}`;
        if (realDataMap.has(rangeLabel)) {
          expanded.push(realDataMap.get(rangeLabel)!);
        }
      }
    }

    const seen = new Set();
    return expanded
      .filter(item => {
        if (seen.has(item.year)) return false;
        seen.add(item.year);
        return true;
      })
      .sort((a, b) => {
        const aStart = parseInt(a.year.split('-')[0], 10);
        const bStart = parseInt(b.year.split('-')[0], 10);
        return aStart - bStart;
      });
  }, [fullYearRange, realDataMap]);

  const stats = useMemo(() => {
    if (!data.length) return null;
    const totalPredictedAcrossYears = data.reduce((sum, d) => sum + d.totalPredicted, 0);
    const totalActualAcrossYears = data.reduce((sum, d) => sum + (d.totalActual || 0), 0);
    const avgPredictedPerYear = totalPredictedAcrossYears / data.length;
    const avgActualPerYear = totalActualAcrossYears / data.length;
    const maxPredictedYear = data.reduce((max, d) => d.totalPredicted > max.totalPredicted ? d : max);
    const maxActualYear = data.reduce((max, d) => (d.totalActual || 0) > (max.totalActual || 0) ? d : max, data[0]);
    let trend = 0;
    const minPredicted = Math.min(...data.map(d => d.totalPredicted));
    if (minPredicted === 0) {
      trend = maxPredictedYear.totalPredicted;
    } else {
      trend = ((maxPredictedYear.totalPredicted - minPredicted) / minPredicted) * 100;
    }
    return { avgPredictedPerYear, avgActualPerYear, maxPredictedYear, maxActualYear, trend };
  }, [data]);

  if (isLoading) {
    return <div className="flex justify-center py-12">Loading yearly data...</div>;
  }
  if (!data.length) {
    return <div className="text-center text-muted-foreground py-12">No yearly yield data available.</div>;
  }

  const predictedData = realData.map(d => ({ year: d.year, predicted: d.totalPredicted }));
  const actualData = realData.filter(d => d.totalActual !== undefined).map(d => ({ year: d.year, actual: d.totalActual }));
  const extrapolatedDataForChart = extrapolatedData.map(d => ({ year: d.year, extrapolated: d.totalPredictedExtrapolated }));

  const hasDataForChart = realData.length > 0;

  return (
    <div className="flex flex-col gap-4">
      <YearlyYieldChart
        predictedData={predictedData}
        actualData={actualData}
        extrapolatedData={extrapolatedDataForChart}
        showActual={true}
      />
      {hasDataForChart && (
        <div className="flex items-start gap-2 text-sm text-muted-foreground min-h-12">
          <Lightbulb className="size-4 mt-0.5 shrink-0" />
          <p>
            Predicted yield peaks at{' '}
            <span className="font-medium">{stats?.maxPredictedYear.totalPredicted.toFixed(2)} t/ha</span> in{' '}
            <span className="font-medium">{stats?.maxPredictedYear.year}</span>
            {stats?.maxActualYear.totalActual ? (
              `, while actual yield peaks at ${stats.maxActualYear.totalActual.toFixed(2)} t/ha in ${stats.maxActualYear.year}.`
            ) : '.'}
            {' '}Average predicted yield per season is{' '}
            <span className="font-medium">{stats?.avgPredictedPerYear.toFixed(2)} t/ha</span>
            {stats?.avgActualPerYear ? `, and average actual yield is ${stats.avgActualPerYear.toFixed(2)} t/ha.` : '.'}
            {' '}Variation between highest and lowest predicted yield is{' '}
            <span className="font-medium">{stats?.trend.toFixed(1)}%</span>.
          </p>
        </div>
      )}
    </div>
  );
}

function linearRegression(points: { x: number; y: number }[]) {
  const n = points.length;
  if (n < 2) return null;
  const sumX = points.reduce((s, p) => s + p.x, 0);
  const sumY = points.reduce((s, p) => s + p.y, 0);
  const sumXY = points.reduce((s, p) => s + p.x * p.y, 0);
  const sumX2 = points.reduce((s, p) => s + p.x * p.x, 0);
  const denominator = n * sumX2 - sumX * sumX;
  if (denominator === 0) return null;
  const slope = (n * sumXY - sumX * sumY) / denominator;
  const intercept = (sumY - slope * sumX) / n;
  return { slope, intercept };
}
