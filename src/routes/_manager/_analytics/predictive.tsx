// @ts-nocheck

import { PageContainer } from '@/core/components/layout';
import { Spinner } from '@/core/components/ui/spinner';
import { createCrumbLoader } from '@/core/utils/breadcrumb';
import { createFileRoute } from '@tanstack/react-router';
import { useState, useMemo, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useYieldForecast, yieldForecastOptions } from '@/features/analytics/hooks/useYieldForecast';
import { YieldForecastView } from '@/features/analytics/views/predictive/YieldForecastView';
import { useAvailableLocationsForPredictions } from '@/features/mfid/hooks/useAvailableLocations';
import { useRiceVarieties, useSoilTypes } from '@/features/analytics/hooks/useRiceVarieties';
import { YearlyOverviewView } from '@/features/analytics/views/predictive/YieldOverviewView';
import { Separator } from '@/core/components/ui/separator';

export const Route = createFileRoute("/_manager/_analytics/predictive")({
  component: RouteComponent,
  loaderDeps: ({ search: { seasonId } }) => ({ seasonId }),
  loader: async ({ context: { queryClient }, deps: { seasonId } }) => {
    const defaultParams = {
      seasonId,
      province: undefined,
      municipality: undefined,
      barangay: undefined,
      method: undefined,
      riceVarietyName: undefined,
      soilType: undefined,
    };
    await queryClient.ensureQueryData(yieldForecastOptions(defaultParams));
    return { breadcrumb: createCrumbLoader({ label: "Predictive Analytics" }) };
  },
  head: () => ({ meta: [{ title: "Predictive Analytics | Humay" }] }),
});

function RouteComponent() {
  const { seasonId } = Route.useSearch();
  const queryClient = useQueryClient();

  const [location, setLocation] = useState({ province: '', municipality: '', barangay: '' });
  const [moreFilters, setMoreFilters] = useState({
    method: [] as string[],
    riceVarietyName: [] as string[],
    soilType: [] as string[],
  });

  const { data: availableLocations, isLoading: locationsLoading } = useAvailableLocationsForPredictions(seasonId);

  const { data: riceVarieties = [] } = useRiceVarieties(seasonId, location.province || undefined, location.municipality || undefined);
  const { data: soilTypes = [] } = useSoilTypes(seasonId, location.province || undefined, location.municipality || undefined);

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

  const riceVarietyOptions = useMemo(() =>
    riceVarieties.map(v => ({ value: v, label: v })), [riceVarieties]
  );
  const soilTypeOptions = useMemo(() =>
    soilTypes.map(s => ({ value: s, label: s })), [soilTypes]
  );

  const { data: forecastData, isLoading: forecastLoading } = useYieldForecast({
    seasonId,
    province: location.province || undefined,
    municipality: location.municipality || undefined,
    barangay: location.barangay || undefined,
    method: moreFilters.method[0],
    riceVarietyName: moreFilters.riceVarietyName[0],
    soilType: moreFilters.soilType[0],
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
    setMoreFilters({ method: [], riceVarietyName: [], soilType: [] });
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
      method: moreFilters.method[0],
      riceVarietyName: moreFilters.riceVarietyName[0],
      soilType: moreFilters.soilType[0],
    };
    queryClient.prefetchQuery(yieldForecastOptions(baseParams));
  }, [seasonId, moreFilters, queryClient]);

  const prefetchMoreFilterData = useCallback((
    method?: string,
    riceVarietyName?: string,
    soilType?: string
  ) => {
    const params = {
      seasonId,
      province: location.province || undefined,
      municipality: location.municipality || undefined,
      barangay: location.barangay || undefined,
      method: method ?? moreFilters.method[0],
      riceVarietyName: riceVarietyName ?? moreFilters.riceVarietyName[0],
      soilType: soilType ?? moreFilters.soilType[0],
    };
    queryClient.prefetchQuery(yieldForecastOptions(params));
  }, [seasonId, location, moreFilters, queryClient]);

  if (forecastLoading) return <PendingComponent />;

  return (
    <PageContainer>
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
        riceVarietyOptions={riceVarietyOptions}
        soilTypeOptions={soilTypeOptions}
        isLoadingProvinces={locationsLoading}
        isLoadingMunicipalities={locationsLoading}
        isLoadingBarangays={locationsLoading}
        prefetchLocationData={prefetchLocationData}
        prefetchMoreFilterData={prefetchMoreFilterData}
      />
      {/* <Separator /> */}

      <YearlyOverviewView />
    </PageContainer>
  );
  // return (
  //   <PageContainer>
  //     <Tabs defaultValue="overview">
  //       <TabsList variant="line">
  //         <TabsTrigger value="overview">Overview</TabsTrigger>
  //         <TabsTrigger value="forecast">Forecast</TabsTrigger>
  //       </TabsList>
  //       <TabsContent value='overview'>
  //         <YearlyOverviewView />
  //       </TabsContent>
  //       <TabsContent value='forecast'>
  //         <YieldForecastView
  //           data={forecastData!}
  //           seasonId={seasonId}
  //           location={location}
  //           onLocationChange={handleLocationChange}
  //           moreFilters={moreFilters}
  //           onMoreFiltersChange={handleMoreFiltersChange}
  //           onResetAll={resetAll}
  //           provinceOptions={provinceOptions}
  //           municipalityOptions={municipalityOptions}
  //           barangayOptions={barangayOptions}
  //           riceVarietyOptions={riceVarietyOptions}
  //           soilTypeOptions={soilTypeOptions}
  //           isLoadingProvinces={locationsLoading}
  //           isLoadingMunicipalities={locationsLoading}
  //           isLoadingBarangays={locationsLoading}
  //           prefetchLocationData={prefetchLocationData}
  //           prefetchMoreFilterData={prefetchMoreFilterData}
  //         />
  //       </TabsContent>
  //     </Tabs>
  //   </PageContainer>
  // );
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
