// @ts-nocheck

import { PageContainer } from '@/core/components/layout';
import { Spinner } from '@/core/components/ui/spinner';
import { createCrumbLoader } from '@/core/utils/breadcrumb';
import { createFileRoute } from '@tanstack/react-router';
import { useState, useMemo, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Tabs, TabsList, TabsTrigger } from '@/core/components/ui/tabs';
import { usePredictedYieldByLocation, predictedYieldByLocationOptions } from '@/features/analytics/hooks/usePredictiveAnalytics';
import { PredictedYieldByLocationView } from '@/features/analytics/views/predictive/PredictiveYieldByLocationView';
import { useYieldForecast, yieldForecastOptions } from '@/features/analytics/hooks/useYieldForecast';
import { YieldForecastView } from '@/features/analytics/views/predictive/YieldForecastView';
import { Button } from '@/core/components/ui/button';
import { usePredictForms } from '@/features/analytics/hooks/usePredictForms';
import { useAvailableLocationsForPredictions } from '@/features/mfid/hooks/useAvailableLocations';

export const Route = createFileRoute("/_manager/_analytics/predictive")({
  component: RouteComponent,
  // Prefetch initial data with empty filters
  loaderDeps: ({ search: { seasonId } }) => ({ seasonId }),
  loader: async ({ context: { queryClient }, deps: { seasonId } }) => {
    const defaultParams = {
      seasonId,
      province: undefined,
      municipality: undefined,
      barangay: undefined,
      method: undefined,
      variety: undefined,
    };
    await Promise.all([
      queryClient.ensureQueryData(predictedYieldByLocationOptions(defaultParams)),
      queryClient.ensureQueryData(yieldForecastOptions(defaultParams)),
    ]);
    return { breadcrumb: createCrumbLoader({ label: "Predictive Analytics" }) };
  },
  head: () => ({ meta: [{ title: "Predictive Analytics | Humay" }] }),
});

type PredictiveView = 'forecast' | 'general';

function RouteComponent() {
  const { seasonId } = Route.useSearch();

  const [view, setView] = useState<PredictiveView>('forecast');
  const queryClient = useQueryClient();

  const [location, setLocation] = useState({ province: '', municipality: '', barangay: '' });
  const [moreFilters, setMoreFilters] = useState({ variety: [] as string[], method: [] as string[] });

  const { data: availableLocations, isLoading: locationsLoading } = useAvailableLocationsForPredictions(seasonId);

  const provinceOptions = useMemo(() =>
    availableLocations?.provinces.map(name => ({ value: name, label: name })) ?? [],
    [availableLocations]
  );

  const municipalityOptions = useMemo(() => {
    if (!availableLocations) return [];
    let filtered = availableLocations.municipalities;
    if (location.province) {
      filtered = filtered.filter(m => m.province === location.province);
    }
    return filtered.map(m => ({ value: m.name, label: m.name }));
  }, [availableLocations, location.province]);

  const barangayOptions = useMemo(() => {
    if (!availableLocations) return [];
    let filtered = availableLocations.barangays;
    if (location.municipality) {
      filtered = filtered.filter(b => b.municipality === location.municipality);
    }
    return filtered.map(b => ({ value: b.name, label: b.name }));
  }, [availableLocations, location.municipality]);

  const { data: locationData, isLoading: locationLoading } = usePredictedYieldByLocation({
    seasonId,
    province: location.province || undefined,
    municipality: location.municipality || undefined,
    barangay: location.barangay || undefined,
    method: moreFilters.method.length === 1 ? moreFilters.method[0] : undefined,
    variety: moreFilters.variety.length === 1 ? moreFilters.variety[0] : undefined,
  });

  const { data: forecastData, isLoading: forecastLoading } = useYieldForecast({
    seasonId,
    province: location.province || undefined,
    municipality: location.municipality || undefined,
    barangay: location.barangay || undefined,
    method: moreFilters.method.length === 1 ? moreFilters.method[0] : undefined,
    variety: moreFilters.variety.length === 1 ? moreFilters.variety[0] : undefined,
  });

  const handleLocationChange = (key: keyof typeof location, value: string) => {
    if (key === 'province') setLocation(prev => ({ ...prev, province: value, municipality: '', barangay: '' }));
    else if (key === 'municipality') setLocation(prev => ({ ...prev, municipality: value, barangay: '' }));
    else if (key === 'barangay') setLocation(prev => ({ ...prev, barangay: value }));
  };

  const handleMoreFiltersChange = (key: keyof typeof moreFilters, value: string[]) => {
    setMoreFilters(prev => ({ ...prev, [key]: value }));
  };

  const resetAll = () => {
    setLocation({ province: '', municipality: '', barangay: '' });
    setMoreFilters({ variety: [], method: [] });
  };

  const prefetchLocationData = useCallback((
    province?: string,
    municipality?: string,
    barangay?: string
  ) => {
    if (!province && !municipality && !barangay) return;

    const baseParams = {
      seasonId,
      province,
      municipality,
      barangay,
      method: moreFilters.method.length === 1 ? moreFilters.method[0] : undefined,
      variety: moreFilters.variety.length === 1 ? moreFilters.variety[0] : undefined,
    };

    queryClient.prefetchQuery(predictedYieldByLocationOptions(baseParams));
    queryClient.prefetchQuery(yieldForecastOptions(baseParams));
  }, [seasonId, moreFilters, queryClient]);

  const prefetchMoreFilterData = useCallback((
    method?: string,
    variety?: string
  ) => {
    const params = {
      seasonId,
      province: location.province || undefined,
      municipality: location.municipality || undefined,
      barangay: location.barangay || undefined,
      method: method || (moreFilters.method.length === 1 ? moreFilters.method[0] : undefined),
      variety: variety || (moreFilters.variety.length === 1 ? moreFilters.variety[0] : undefined),
    };

    queryClient.prefetchQuery(predictedYieldByLocationOptions(params));
    queryClient.prefetchQuery(yieldForecastOptions(params));
  }, [seasonId, location, moreFilters, queryClient]);


  const isLoading = locationLoading || forecastLoading;

  if (isLoading) return <PendingComponent />;

  return (
    <PageContainer>
      <Tabs value={view} onValueChange={(v) => setView(v as PredictiveView)}>
        <TabsList variant="line">
          <TabsTrigger value="forecast">Forecast</TabsTrigger>
          {/* <TabsTrigger value="general">By Location</TabsTrigger> */}
        </TabsList>
      </Tabs>

      {view === 'general' && <PredictedYieldByLocationView data={locationData} />}
      {view === 'forecast' && (
        <YieldForecastView
          data={forecastData!}
          seasonId={seasonId}
          location={location}
          onLocationChange={handleLocationChange}
          moreFilters={moreFilters}
          onMoreFiltersChange={handleMoreFiltersChange}
          onResetAll={resetAll}
          provinceOptions={provinceOptions}
          municipalityOptions={municipalityOptions}
          barangayOptions={barangayOptions}
          isLoadingProvinces={locationsLoading}
          isLoadingMunicipalities={locationsLoading}
          isLoadingBarangays={locationsLoading}
          prefetchLocationData={prefetchLocationData}
          prefetchMoreFilterData={prefetchMoreFilterData}
        />
      )}

    </PageContainer>
  );
}

function PendingComponent() {
  return (
    <PageContainer>
      <div className="flex flex-col items-center justify-center h-full">
        <Spinner className="size-10" />
        <p className="text-muted-foreground text-sm">Loading</p>
      </div>
    </PageContainer>
  );
}
