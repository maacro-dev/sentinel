// @ts-nocheck

import * as z from "zod/v4"
import { PageContainer } from '@/core/components/layout';
import { Spinner } from '@/core/components/ui/spinner';
import { createCrumbLoader } from '@/core/utils/breadcrumb';
import { comparativeViewMap, MoreFilters } from '@/features/analytics/comparative-map';
import { ComparativeToolbar } from '@/features/analytics/components/ComparativeToolbar';
import { useComparisonDamageCauseData } from '@/features/analytics/hooks/useComparisonDamageCauseData';
import { useComparisonDamageLocationData } from '@/features/analytics/hooks/useComparisonDamageLocationData';
import { useComparisonYieldData } from '@/features/analytics/hooks/useComparisonYieldData';
import { useComparisonYieldMethodData } from '@/features/analytics/hooks/useComparisonYieldMethodData';
import { useComparisonYieldVarietyData } from '@/features/analytics/hooks/useComparisonYieldVarietyData';
import { useDamageAnalytics } from '@/features/analytics/hooks/useDamageAnalytics';
import { useYieldComparativeData } from '@/features/analytics/hooks/useYieldAnalytics';
import { damageByCauseOptions, damageByLocationOptions, yieldByLocationOptions, yieldByMethodOptions, yieldByVarietyOptions } from '@/features/analytics/queries/options';
import { ComparativeView } from '@/features/analytics/types';
import { useSeasonLabel } from '@/features/fields/hooks/useSeasons';
import { useAvailableLocations } from '@/features/mfid/hooks/useAvailableLocations';
import { useLocationHierarchy } from '@/features/mfid/hooks/useLgu';
import { useQueryClient } from '@tanstack/react-query';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useCallback, useMemo, useState } from 'react';

export const Route = createFileRoute("/_manager/_analytics/comparative")({
  component: RouteComponent,
  validateSearch: z.object({
    seasonId: z.coerce.number().optional(),
    compareSeasonId: z.coerce.number().optional(),
  }),
  loaderDeps: ({ search: { seasonId } }) => ({ seasonId }),
  loader: async ({ context: { queryClient }, deps: { seasonId } }) => {
    const defaultParam = { seasonId: seasonId, province: undefined, municipality: undefined, barangay: undefined, method: undefined, variety: undefined }

    queryClient.ensureQueryData(yieldByLocationOptions(defaultParam))
    queryClient.ensureQueryData(yieldByMethodOptions(defaultParam))
    queryClient.ensureQueryData(yieldByVarietyOptions(defaultParam))
    queryClient.ensureQueryData(damageByLocationOptions(defaultParam));
    queryClient.ensureQueryData(damageByCauseOptions(defaultParam));
    return { breadcrumb: createCrumbLoader({ label: "Comparative Analytics" }) }
  },
  head: () => ({ meta: [{ title: "Comparative Analytics | Humay" }] }),
});

function RouteComponent() {
  const { seasonId, compareSeasonId } = Route.useSearch()

  const navigate = useNavigate({ from: Route.fullPath });

  const [view, setView] = useState<ComparativeView>('yield-location');

  const [moreFilters, setMoreFilters] = useState<MoreFilters>({ variety: [], method: [] });

  const {
    location,
    setProvince,
    setMunicipality,
    setBarangay,
    resetLocation,
  } = useLocationHierarchy();

  const { data: availableLocations, isLoading: locationsLoading } = useAvailableLocations(seasonId);

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

  const handleLocationChange = (key: keyof typeof location, value: string) => {
    if (key === 'province') setProvince(value);
    else if (key === 'municipality') setMunicipality(value);
    else if (key === 'barangay') setBarangay(value);
  };

  const handleMoreFiltersChange = (key: keyof typeof moreFilters, value: string[]) => {
    setMoreFilters(prev => ({ ...prev, [key]: value }));
  };

  const { byLocation: yieldByLocation, byMethod, byVariety } = useYieldComparativeData({
    seasonId: seasonId,
    province: location.province || undefined,
    municipality: location.municipality || undefined,
    barangay: location.barangay || undefined,
    method: moreFilters.method.length === 1 ? moreFilters.method[0] : undefined,
    variety: moreFilters.variety.length === 1 ? moreFilters.variety[0] : undefined,
  });

  const { byLocation: damageByLocation, byCause: damageByCause } = useDamageAnalytics({
    seasonId: seasonId,
    province: location.province || undefined,
    municipality: location.municipality || undefined,
    barangay: location.barangay || undefined,
    method: moreFilters.method.length === 1 ? moreFilters.method[0] : undefined,
    variety: moreFilters.variety.length === 1 ? moreFilters.variety[0] : undefined,
  })

  const yieldLocationCompare = useComparisonYieldData({
    seasonId,
    compareSeasonId,
    province: location.province || undefined,
    municipality: location.municipality || undefined,
    barangay: location.barangay || undefined,
    method: moreFilters.method.length === 1 ? moreFilters.method[0] : undefined,
    variety: moreFilters.variety.length === 1 ? moreFilters.variety[0] : undefined,
  });

  const yieldMethodCompare = useComparisonYieldMethodData({
    seasonId,
    compareSeasonId,
    province: location.province || undefined,
    municipality: location.municipality || undefined,
    barangay: location.barangay || undefined,
    method: moreFilters.method.length === 1 ? moreFilters.method[0] : undefined,
    variety: moreFilters.variety.length === 1 ? moreFilters.variety[0] : undefined,
  });

  const yieldVarietyCompare = useComparisonYieldVarietyData({
    seasonId,
    compareSeasonId,
    province: location.province || undefined,
    municipality: location.municipality || undefined,
    barangay: location.barangay || undefined,
    method: moreFilters.method.length === 1 ? moreFilters.method[0] : undefined,
    variety: moreFilters.variety.length === 1 ? moreFilters.variety[0] : undefined,
  });

  const damageLocationCompare = useComparisonDamageLocationData({
    seasonId,
    compareSeasonId,
    province: location.province || undefined,
    municipality: location.municipality || undefined,
    barangay: location.barangay || undefined,
    method: moreFilters.method.length === 1 ? moreFilters.method[0] : undefined,
    variety: moreFilters.variety.length === 1 ? moreFilters.variety[0] : undefined,
  });

  const damageCauseCompare = useComparisonDamageCauseData({
    seasonId,
    compareSeasonId,
    province: location.province || undefined,
    municipality: location.municipality || undefined,
    barangay: location.barangay || undefined,
    method: moreFilters.method.length === 1 ? moreFilters.method[0] : undefined,
    variety: moreFilters.variety.length === 1 ? moreFilters.variety[0] : undefined,
  });


  const queryClient = useQueryClient();

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

    queryClient.prefetchQuery(yieldByLocationOptions(baseParams));
    queryClient.prefetchQuery(yieldByMethodOptions(baseParams));
    queryClient.prefetchQuery(yieldByVarietyOptions(baseParams));
    queryClient.prefetchQuery(damageByLocationOptions(baseParams));
    queryClient.prefetchQuery(damageByCauseOptions(baseParams));
  }, [seasonId, moreFilters, queryClient]);

  const prefetchWithFilters = useCallback((
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

    queryClient.prefetchQuery(yieldByLocationOptions(params));
    queryClient.prefetchQuery(yieldByMethodOptions(params));
    queryClient.prefetchQuery(yieldByVarietyOptions(params));
    queryClient.prefetchQuery(damageByLocationOptions(params));
    queryClient.prefetchQuery(damageByCauseOptions(params));
  }, [seasonId, location, moreFilters, queryClient]);

  const resetAll = () => {
    setView('yield-location');
    resetLocation();
    setMoreFilters({ variety: [], method: [] });
  };

  const viewData = {
    'yield-location': yieldByLocation.data,
    'yield-method': byMethod.data,
    'yield-variety': byVariety.data,
    'damage-location': damageByLocation.data,
    'damage-cause': damageByCause.data
  };

  const viewLoading = {
    'yield-location': yieldByLocation.isLoading,
    'yield-method': byMethod.isLoading,
    'yield-variety': byVariety.isLoading,
    'damage-location': damageByLocation.isLoading,
    'damage-cause': damageByCause.isLoading
  };

  const activeData = viewData[view];
  const isLoading = viewLoading[view] ?? false;
  const ViewComponent = comparativeViewMap[view];

  const level = useMemo(() => {
    if (location.municipality) return 'barangay';
    if (location.province) return 'municipality';
    return 'province';
  }, [location]);


  const handleCompareSeasonChange = (newId: number) => {
    navigate({
      search: (prev) => ({ ...prev, compareSeasonId: newId }),
      replace: true,
    });
  };

  const handleClearComparison = () => {
    navigate({
      search: (prev) => ({ ...prev, compareSeasonId: undefined }),
      replace: true,
    });
  };

  const currentSeasonLabel = useSeasonLabel(seasonId);
  const compareSeasonLabel = useSeasonLabel(compareSeasonId);

  const comparisonMap = {
    'yield-location': { data: yieldLocationCompare.data, stats: yieldLocationCompare.comparisonStats, },
    'yield-method': { data: yieldMethodCompare.data, stats: yieldMethodCompare.comparisonStats, },
    'yield-variety': { data: yieldVarietyCompare.data, stats: yieldVarietyCompare.comparisonStats, },
    'damage-location': { data: damageLocationCompare.data, stats: damageLocationCompare.comparisonStats },
    'damage-cause': { data: damageCauseCompare.data, stats: damageCauseCompare.comparisonStats },
  };

  if (isLoading || !activeData) {
    return <PendingComponent />
  }

  return (
    <PageContainer>
      <ComparativeToolbar
        view={view}
        onViewChange={setView}
        location={location}
        onLocationChange={handleLocationChange}
        provinces={provinceOptions}
        municipalities={municipalityOptions}
        barangays={barangayOptions}
        moreFilters={moreFilters}
        onMoreFiltersChange={handleMoreFiltersChange}
        onResetAll={resetAll}
        isLoadingProvinces={locationsLoading}
        isLoadingMunicipalities={locationsLoading}
        isLoadingBarangays={locationsLoading}
        prefetchLocationData={prefetchLocationData}
        prefetchMoreFilterData={prefetchWithFilters}
        compareSeasonId={compareSeasonId}
        onCompareSeasonChange={handleCompareSeasonChange}
        onClearComparison={handleClearComparison}
      />

      {ViewComponent && (
        <ViewComponent
          data={activeData}
          isLoading={isLoading}
          {...(view === 'yield-location' ? { level } : {})}
          compareData={comparisonMap[view]?.data}
          currentSeasonLabel={currentSeasonLabel}
          compareSeasonLabel={compareSeasonLabel}
          comparisonStats={comparisonMap[view]?.stats}
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
