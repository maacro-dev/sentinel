

import { Lightbulb, RefreshCw } from 'lucide-react';
import { StatCardMinimal } from '../../components/StatCard';
import { TrendChart } from '../../components/TrendChart';
import { YieldForecastData } from '../../schemas/predictive/forecast';
import { PredictiveFilters } from '../../components/PredictiveFilters';
import { useMemo } from 'react';
import { LocationFilters, MoreFilters } from '../../types';
import { usePredictForms } from '../../hooks/usePredictForms';
import { Button } from '@/core/components/ui/button';

interface YieldForecastViewProps {
  data: YieldForecastData;
  seasonId: number;

  location: { province: string; municipality: string; barangay: string };
  onLocationChange: (key: keyof LocationFilters, value: string) => void;
  moreFilters: { variety: string[]; method: string[] };
  onMoreFiltersChange: (key: keyof MoreFilters, value: string[]) => void;
  onResetAll: () => void;

  provinceOptions: Array<{ value: string; label: string }>;
  municipalityOptions: Array<{ value: string; label: string }>;
  barangayOptions: Array<{ value: string; label: string }>;

  isLoadingProvinces?: boolean;
  isLoadingMunicipalities?: boolean;
  isLoadingBarangays?: boolean;

  prefetchLocationData?: (province?: string, municipality?: string, barangay?: string) => void;
  prefetchMoreFilterData?: (method?: string, variety?: string) => void;
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
  isLoadingProvinces,
  isLoadingMunicipalities,
  isLoadingBarangays,
  prefetchLocationData,
  prefetchMoreFilterData,
}: YieldForecastViewProps) {

  console.log("Yield forecast data:", JSON.stringify(data, null, 2))

  const { mutate: predictForms, isPending: isPredicting } = usePredictForms(seasonId);

  const chartData = useMemo(() => {
    return data.forecast.map(item => ({
      month: item.month,
      total_yield: Number(item.total_yield.toFixed(2)),
      avg_yield_per_field: Number(item.avg_yield_per_field.toFixed(2)),
    }));
  }, [data]);

  const yDomain = useMemo(() => {
    if (chartData.length === 0) return [0, 5];
    const yields = chartData.map(d => d.avg_yield_per_field);
    const min = Math.min(...yields);
    const max = Math.max(...yields);
    const padding = 0.2;
    return [Math.max(0, min - padding), max + padding];
  }, [chartData]);

  const config = {
    avg_yield_per_field: { label: 'Avg Yield per Field (t/ha)' },
  };

  const header = {
    title: 'Yield Forecast',
    description: 'Average yield per field by month',
  };

  const avgYields = chartData.map(d => d.avg_yield_per_field);
  const peakAvgYield = Math.max(...avgYields);
  const peakAvgMonth = chartData.find(d => d.avg_yield_per_field === peakAvgYield)?.month;
  const minAvgYield = Math.min(...avgYields);
  const avgChange = peakAvgYield > 0 ? ((peakAvgYield - minAvgYield) / peakAvgYield) * 100 : 0;
  const riskLevel = avgChange > 30 ? 'High' : avgChange > 15 ? 'Medium' : 'Low';

  return (
    <div className='flex gap-4'>

      <div className={'w-full max-w-56 flex-col'}>
        <PredictiveFilters
          location={location}
          onLocationChange={onLocationChange}
          provinces={provinceOptions}
          municipalities={municipalityOptions}
          barangays={barangayOptions}
          moreFilters={moreFilters}
          onMoreFiltersChange={onMoreFiltersChange}
          onResetAll={onResetAll}
          isLoadingProvinces={isLoadingProvinces}
          isLoadingMunicipalities={isLoadingMunicipalities}
          isLoadingBarangays={isLoadingBarangays}
          prefetchLocationData={prefetchLocationData || (() => { })}
          prefetchMoreFilterData={prefetchMoreFilterData}
        />
        <Button className="w-full text-sm gap-1.5 mt-6" onClick={() => predictForms()} disabled={isPredicting}>
          {isPredicting ? (<RefreshCw className="size-3 animate-spin" />) : (<RefreshCw className="size-3" />)}
          {isPredicting ? "Predicting..." : "Predict Available Forms"}
        </Button>
      </div>
      <div className="flex-1 flex flex-col gap-4">
        <div className="grid auto-rows-min gap-4 md:grid-cols-4">
          <StatCardMinimal
            title="Total Predicted Yield"
            subtitle="Season total"
            current_value={Number(data.total_predicted.toFixed(2))}
            unit="t/ha"
          />
          <StatCardMinimal
            title="Average Yield per Field"
            subtitle="Season average"
            current_value={Number(data.overall_avg_yield_per_field.toFixed(2))}
            unit="t/ha"
          />
          <StatCardMinimal
            title="Expected Change"
            subtitle="Peak vs trough"
            current_value={Number(avgChange.toFixed(1))}
            unit="%"
          />
          <StatCardMinimal
            title="Risk Level"
            subtitle={riskLevel}
            current_value={0}
            unit=""
          />
        </div>

        <TrendChart
          data={chartData}
          header={header}
          axisKeys={{ X: 'month', Y: 'avg_yield_per_field' }}
          isEmpty={chartData.length === 0}
          config={config}
          axisOptions={{
            X: { interval: 0 },
            Y: {
              tickFormatter: (value: number) => `${value.toFixed(2)} t/ha`,
              domain: yDomain,
            },
          }}
          cardClass="min-h-120"
        />

        <div className="flex items-start gap-2 text-sm text-muted-foreground min-h-12">
          <Lightbulb className="size-4 mt-0.5 shrink-0" />
          <p>
            {data.forecast.length > 0 ? (
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
    </div >
  );
}
