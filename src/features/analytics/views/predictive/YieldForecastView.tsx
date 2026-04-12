// @ts-nocheck

import { Lightbulb, RefreshCw } from 'lucide-react';
import { StatCardMinimal } from '../../components/StatCard';
import { YieldForecastData } from '../../schemas/predictive/forecast';
import { PredictiveFilters } from '../../components/PredictiveFilters';
import { useMemo } from 'react';
import { LocationFilters, MoreFilters } from '../../types';
import { usePredictForms } from '../../hooks/usePredictForms';
import { Button } from '@/core/components/ui/button';
import { YieldForecastChart } from '../../components/YieldForecastChart/YieldForecastChart';

interface YieldForecastViewProps {
  data: YieldForecastData;
  seasonId: number;

  location: LocationFilters;
  onLocationChange: (key: keyof LocationFilters, value: string) => void;
  moreFilters: MoreFilters;  // now includes method, riceVarietyName, soilType
  onMoreFiltersChange: (key: keyof MoreFilters, value: string[]) => void;
  onResetAll: () => void;

  provinceOptions: Array<{ value: string; label: string }>;
  municipalityOptions: Array<{ value: string; label: string }>;
  barangayOptions: Array<{ value: string; label: string }>;
  riceVarietyOptions: Array<{ value: string; label: string }>;
  soilTypeOptions: Array<{ value: string; label: string }>;

  isLoadingProvinces?: boolean;
  isLoadingMunicipalities?: boolean;
  isLoadingBarangays?: boolean;

  prefetchLocationData?: (province?: string, municipality?: string, barangay?: string) => void;
  prefetchMoreFilterData?: (method?: string, riceVarietyName?: string, soilType?: string) => void;
}

export function YieldForecastView({
  data,
  seasonId,
  location,
  onLocationChange,
  moreFilters,
  onMoreFiltersChange,
  onResetAll,
  provinceOptions,
  municipalityOptions,
  barangayOptions,
  riceVarietyOptions,
  soilTypeOptions,
  isLoadingProvinces,
  isLoadingMunicipalities,
  isLoadingBarangays,
  prefetchLocationData,
  prefetchMoreFilterData,
}: YieldForecastViewProps) {

  const { mutate: predictForms, isPending: isPredicting } = usePredictForms(seasonId);

  const chartData = useMemo(() => {
    return data.predicted_forecast.map(item => ({
      month: item.month,
      total_yield: Number(item.total_yield.toFixed(2)),
      avg_yield_per_field: Number(item.avg_yield_per_field.toFixed(2)),
    }));
  }, [data]);

  const avgYields = chartData.map(d => d.avg_yield_per_field);
  const peakAvgYield = Math.max(...avgYields);
  const peakAvgMonth = chartData.find(d => d.avg_yield_per_field === peakAvgYield)?.month;
  const minAvgYield = Math.min(...avgYields);
  const avgChange = peakAvgYield > 0 ? ((peakAvgYield - minAvgYield) / peakAvgYield) * 100 : 0;
  const riskLevel = avgChange > 30 ? 'High' : avgChange > 15 ? 'Medium' : 'Low';

  const predictedData = useMemo(() => {
    return reorderForecastByHarvestCycle(data.predicted_forecast, data.harvest_order);
  }, [data.predicted_forecast, data.harvest_order]);

  const actualData = useMemo(() => {
    return reorderForecastByHarvestCycle(data.actual_forecast, data.harvest_order);
  }, [data.actual_forecast, data.harvest_order]);

  const extrapolatedData = useMemo(() => {
    return reorderForecastByHarvestCycle(data.extrapolated_forecast, data.harvest_order);
  }, [data.extrapolated_forecast, data.harvest_order]);

  return (
    <div className='flex gap-4'>
      <div className='w-full max-w-56 flex-col'>
        <PredictiveFilters
          location={location}
          onLocationChange={onLocationChange}
          provinces={provinceOptions}
          municipalities={municipalityOptions}
          barangays={barangayOptions}
          riceVarieties={riceVarietyOptions}
          soilTypes={soilTypeOptions}
          moreFilters={moreFilters}
          onMoreFiltersChange={onMoreFiltersChange}
          onResetAll={onResetAll}
          isLoadingProvinces={isLoadingProvinces}
          isLoadingMunicipalities={isLoadingMunicipalities}
          isLoadingBarangays={isLoadingBarangays}
          prefetchLocationData={prefetchLocationData || (() => {})}
          prefetchMoreFilterData={prefetchMoreFilterData}
        />
        <Button className="w-full text-sm gap-1.5 mt-6" onClick={() => predictForms()} disabled={isPredicting}>
          {isPredicting ? (<RefreshCw className="size-3 animate-spin" />) : (<RefreshCw className="size-3" />)}
          {isPredicting ? "Predicting..." : "Predict Available Forms"}
        </Button>
      </div>
      <div className="flex-1 flex flex-col gap-4">
        <div className="grid auto-rows-min gap-4 md:grid-cols-4">
          <StatCardMinimal title="Total Predicted Yield" subtitle="Season total" current_value={Number(data.total_predicted.toFixed(2))} unit="t/ha" />
          <StatCardMinimal title="Average Yield per Field" subtitle="Season average" current_value={Number(data.overall_avg_yield_per_field.toFixed(2))} unit="t/ha" />
          <StatCardMinimal title="Expected Change" subtitle="Peak vs trough" current_value={Number(avgChange.toFixed(1))} unit="%" />
          <StatCardMinimal title="Risk Level" subtitle="Based on yield variation" current_value={riskLevel} unit="" />
        </div>
        <YieldForecastChart
          predicted={predictedData}
          actual={actualData}
          extrapolated={extrapolatedData}
          harvestOrder={data.harvest_order}
          title="Yield Forecast"
          description="Average yield per field by month"
        />
        <div className="flex items-start gap-2 text-sm text-muted-foreground min-h-12">
          <Lightbulb className="size-4 mt-0.5 shrink-0" />
          <p>
            {data.predicted_forecast.length > 0 ? (
              <>
                The average yield per field peaks at <span className="font-medium">{peakAvgYield.toFixed(2)} t/ha</span> in {peakAvgMonth},{' '}
                with a variation of <span className="font-medium">{avgChange.toFixed(1)}%</span> across the season.
                The overall season average is <span className="font-medium">{data.overall_avg_yield_per_field.toFixed(2)} t/ha</span>.
                The risk level is <span className="font-medium">{riskLevel}</span>.
              </>
            ) : (
              'No forecast data available.'
            )}
          </p>
        </div>
      </div>
    </div>
  );
}

export function reorderForecastByHarvestCycle(
  data: Array<{ month: string; [key: string]: any }>,
  harvestOrder: string[]
): Array<{ month: string; [key: string]: any }> {
  const orderIndex = new Map(harvestOrder.map((m, i) => [m, i]));
  return [...data].sort((a, b) => {
    const [aMon, aYear] = a.month.split(' ');
    const [bMon, bYear] = b.month.split(' ');
    const yearDiff = parseInt(aYear, 10) - parseInt(bYear, 10);
    if (yearDiff !== 0) return yearDiff;
    return (orderIndex.get(aMon) ?? 999) - (orderIndex.get(bMon) ?? 999);
  });
}
