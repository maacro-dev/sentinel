import { useQueries } from '@tanstack/react-query';
import { useSeasons } from '@/features/fields/hooks/useSeasons';
import { yieldForecastOptions } from './useYieldForecast';
import { useMemo } from 'react';
import { YieldForecastData } from '../schemas/predictive/forecast'; // adjust path

interface YearlyDataPoint {
  year: string;
  totalPredicted: number;
  totalActual?: number;
}

export function useYearlyYieldOverview() {
  const { data: seasons, isLoading: seasonsLoading } = useSeasons();

  const forecastQueries = useQueries({
    queries: (seasons ?? []).map(season => ({
      ...yieldForecastOptions({ seasonId: season.id }),
      select: (data: YieldForecastData) => {
        const totalActual = data.actual_forecast.reduce((sum, month) => sum + month.total_yield, 0);
        return {
          year: season.season_year,
          totalPredicted: data.total_predicted, // may be zero
          totalActual: totalActual > 0 ? totalActual : undefined,
        };
      },
    })),
    combine: (results) => {
      const isLoading = results.some(r => r.isLoading);
      const data = results
        .filter(r => r.data)
        .map(r => r.data! as YearlyDataPoint);
      return { data, isLoading };
    },
  });

  const sortedData = useMemo(() => {
    const getStartYear = (yearStr: string) => parseInt(yearStr.split('-')[0], 10);
    const getEndYear = (yearStr: string) => {
      const parts = yearStr.split('-');
      if (parts.length === 1) return parseInt(parts[0], 10);
      return parseInt(parts[1], 10);
    };
    return [...forecastQueries.data].sort((a, b) => {
      const startDiff = getStartYear(a.year) - getStartYear(b.year);
      if (startDiff !== 0) return startDiff;
      return getEndYear(a.year) - getEndYear(b.year);
    });
  }, [forecastQueries.data]);

  return { data: sortedData, isLoading: seasonsLoading || forecastQueries.isLoading };
}


function expandSeasonLabels(
  realData: YearlyDataPoint[]
): YearlyDataPoint[] {
  if (realData.length === 0) return [];

  // Extract all start years from real data
  const years = realData.map(d => parseInt(d.year.split('-')[0], 10)).sort((a,b)=>a-b);
  const minYear = years[0];
  const maxYear = Math.max(...realData.map(d => {
    const parts = d.year.split('-');
    return parts.length === 1 ? parseInt(parts[0],10) : parseInt(parts[1],10);
  }));

  const allSeasons: YearlyDataPoint[] = [];
  const realMap = new Map(realData.map(d => [d.year, d]));

  // Generate every season from minYear to maxYear
  for (let y = minYear; y <= maxYear; y++) {
    // Single-year season (e.g., "2022")
    const singleYear = `${y}`;
    // Range season (e.g., "2022-2023")
    const rangeYear = `${y}-${y+1}`;

    // Add single-year if it exists in real data OR if it's between min and max and not already present
    if (realMap.has(singleYear)) {
      allSeasons.push(realMap.get(singleYear)!);
    } else if (y >= minYear && y <= maxYear) {
      // Insert placeholder with null values
      allSeasons.push({ year: singleYear, totalPredicted: undefined, totalActual: undefined });
    }

    // Add range-year if it exists in real data
    if (realMap.has(rangeYear)) {
      allSeasons.push(realMap.get(rangeYear)!);
    } else if (y < maxYear) {
      // Optionally add placeholder for range years? Usually we don't need them unless data exists.
      // But if you want all possible range years, uncomment:
      // allSeasons.push({ year: rangeYear, totalPredicted: undefined, totalActual: undefined });
    }
  }

  // Remove duplicates (if both single and range exist for same start year)
  const seen = new Set();
  return allSeasons.filter(s => {
    if (seen.has(s.year)) return false;
    seen.add(s.year);
    return true;
  });
}
