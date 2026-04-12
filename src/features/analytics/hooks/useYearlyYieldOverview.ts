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
