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
    compareSeasonIds: z
      .union([
        z.string().transform(s =>
          s.split(',').map(Number).filter(n => !isNaN(n) && n > 0)
        ),
        z.array(z.coerce.number()),
      ])
      .optional()
      .default([]),
  }),
  loaderDeps: ({ search: { seasonId } }) => ({ seasonId }),
  loader: async ({ context: { queryClient }, deps: { seasonId } }) => {
    const defaultParam = { seasonId, province: undefined, municipality: undefined, barangay: undefined, method: undefined, variety: undefined }

    queryClient.ensureQueryData(yieldByLocationOptions(defaultParam))
    queryClient.ensureQueryData(yieldByMethodOptions(defaultParam))
    queryClient.ensureQueryData(yieldByVarietyOptions(defaultParam))
    queryClient.ensureQueryData(damageByLocationOptions(defaultParam));
    queryClient.ensureQueryData(damageByCauseOptions(defaultParam));
    return { breadcrumb: createCrumbLoader({ label: "Comparative Analytics" }) }
  },
  head: () => ({ meta: [{ title: "Comparative Analytics | Humay" }] }),
});


function useSeasonComparison(
  seasonId: number | undefined,
  compareSeasonId: number,
  filters: {
    province?: string;
    municipality?: string;
    barangay?: string;
    method?: string;
    variety?: string;
  }
) {
  const params = { seasonId, compareSeasonId, ...filters };

  const yieldLocation = useComparisonYieldData(params);
  const yieldMethod = useComparisonYieldMethodData(params);
  const yieldVariety = useComparisonYieldVarietyData(params);
  const damageLocation = useComparisonDamageLocationData(params);
  const damageCause = useComparisonDamageCauseData(params);

  return { yieldLocation, yieldMethod, yieldVariety, damageLocation, damageCause };
}


type SeasonComparisonResult = ReturnType<typeof useSeasonComparison>;

function buildComparisonMap(
  results: SeasonComparisonResult[]
): Record<ComparativeView, { data: unknown[]; stats: unknown[]; compareRanking?: unknown[] }> {
  return {
    'yield-location': {
      data: results.map(r => r.yieldLocation.data),
      stats: results.map(r => r.yieldLocation.comparisonStats),
    },
    'yield-method': {
      data: results.map(r => r.yieldMethod.data),
      stats: results.map(r => r.yieldMethod.comparisonStats),
      compareRanking: results.map(r => r.yieldMethod.compareRanking),
    },
    'yield-variety': {
      data: results.map(r => r.yieldVariety.data),
      stats: results.map(r => r.yieldVariety.comparisonStats),
    },
    'damage-location': {
      data: results.map(r => r.damageLocation.data),
      stats: results.map(r => r.damageLocation.comparisonStats),
    },
    'damage-cause': {
      data: results.map(r => r.damageCause.data),
      stats: results.map(r => r.damageCause.comparisonStats),
    },
  };
}

const EMPTY_IDS: number[] = [];

const MAX_COMPARE_SEASONS = 3;

function useSeasonLabels(ids: number[]): string[] {

  const l0 = useSeasonLabel(ids[0]);
  const l1 = useSeasonLabel(ids[1]);
  const l2 = useSeasonLabel(ids[2]);
  return [l0, l1, l2].slice(0, ids.length);
}


function useMultiSeasonComparison(
  seasonId: number | undefined,
  ids: number[],
  filters: Parameters<typeof useSeasonComparison>[2]
): SeasonComparisonResult[] {
  const r0 = useSeasonComparison(seasonId, ids[0] ?? 0, filters);
  const r1 = useSeasonComparison(seasonId, ids[1] ?? 0, filters);
  const r2 = useSeasonComparison(seasonId, ids[2] ?? 0, filters);
  const all = [r0, r1, r2];
  return all.slice(0, ids.length);
}


function RouteComponent() {
  const { seasonId, compareSeasonIds } = Route.useSearch()

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

  const sharedFilters = useMemo(() => ({
    province: location.province || undefined,
    municipality: location.municipality || undefined,
    barangay: location.barangay || undefined,
    method: moreFilters.method.length === 1 ? moreFilters.method[0] : undefined,
    variety: moreFilters.variety.length === 1 ? moreFilters.variety[0] : undefined,
  }), [location, moreFilters]);

  const { byLocation: yieldByLocation, byMethod, byVariety } = useYieldComparativeData({
    seasonId,
    ...sharedFilters,
  });

  const { byLocation: damageByLocation, byCause: damageByCause } = useDamageAnalytics({
    seasonId,
    ...sharedFilters,
  });

  const stableCompareIds = compareSeasonIds ?? EMPTY_IDS;

  const orderedResults = useMultiSeasonComparison(seasonId, stableCompareIds, sharedFilters);
  const comparisonMap = useMemo(() => buildComparisonMap(orderedResults), [orderedResults]);

  const currentSeasonLabel = useSeasonLabel(seasonId);
  const compareSeasonLabels = useSeasonLabels(stableCompareIds);

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

  const handleCompareSeasonIdsChange = (newIds: number[]) => {
    navigate({
      search: (prev) => ({
        ...prev,
        compareSeasonIds: newIds.length > 0 ? newIds : undefined,
      }),
      replace: true,
    });
  };

  const handleClearComparison = () => {
    navigate({
      search: (prev) => ({ ...prev, compareSeasonIds: undefined }),
      replace: true,
    });
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
        compareSeasonIds={stableCompareIds}
        onCompareSeasonIdsChange={handleCompareSeasonIdsChange}
        onClearComparison={handleClearComparison}
      />

      {ViewComponent && (
        <ViewComponent
          data={activeData}
          isLoading={isLoading}
          {...(view === 'yield-location' ? { level } : {})}
          compareData={comparisonMap[view]?.data}
          compareRanking={comparisonMap[view]?.compareRanking}
          currentSeasonLabel={currentSeasonLabel}
          compareSeasonLabels={compareSeasonLabels}
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
