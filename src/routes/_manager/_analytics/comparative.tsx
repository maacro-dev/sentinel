// @ts-nocheck

import * as z from "zod/v4"
import { PageContainer } from '@/core/components/layout';
import { Spinner } from '@/core/components/ui/spinner';
import { createCrumbLoader } from '@/core/utils/breadcrumb';
import { comparativeViewMap, MoreFilters } from '@/features/analytics/comparative-map';
import { ComparativeToolbar } from '@/features/analytics/components/ComparativeToolbar';
import { useDamageAnalytics } from '@/features/analytics/hooks/useDamageAnalytics';
import { useYieldComparativeData } from '@/features/analytics/hooks/useYieldAnalytics';
import {
  damageByCauseOptions,
  damageByLocationOptions,
  yieldByLocationOptions,
  yieldByMethodOptions,
  yieldByVarietyOptions,
} from '@/features/analytics/queries/options';
import { ComparativeView } from '@/features/analytics/types';
import { useSeasonLabel, useSeasonsForSelector } from '@/features/fields/hooks/useSeasons';
import { useAvailableLocations } from '@/features/mfid/hooks/useAvailableLocations';
import { useLocationHierarchy } from '@/features/mfid/hooks/useLgu';
import { useQueryClient } from '@tanstack/react-query';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

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


export interface SeasonComparisonResult {
  compareSeasonId: number;
  yieldLocation: { data: any; comparisonStats: any };
  yieldMethod: { data: any; comparisonStats: any; compareRanking: any };
  yieldVariety: { data: any; comparisonStats: any };
  damageLocation: { data: any; comparisonStats: any };
  damageCause: { data: any; comparisonStats: any };
}

type ComparisonFilters = {
  seasonId?: number;
  province?: string;
  municipality?: string;
  barangay?: string;
  method?: string;
  variety?: string;
};

async function fetchSeasonComparison(
  queryClient: ReturnType<typeof useQueryClient>,
  { seasonId, compareSeasonId, ...filters }: ComparisonFilters & { compareSeasonId: number }
): Promise<SeasonComparisonResult> {
  const base = { ...filters };

  const [
    ylCurrent, ylCompare,
    ymCurrent, ymCompare,
    yvCurrent, yvCompare,
    dlCurrent, dlCompare,
    dcCurrent, dcCompare,
  ] = await Promise.all([
    queryClient.fetchQuery(yieldByLocationOptions({ ...base, seasonId })),
    queryClient.fetchQuery(yieldByLocationOptions({ ...base, seasonId: compareSeasonId })),
    queryClient.fetchQuery(yieldByMethodOptions({ ...base, seasonId })),
    queryClient.fetchQuery(yieldByMethodOptions({ ...base, seasonId: compareSeasonId })),
    queryClient.fetchQuery(yieldByVarietyOptions({ ...base, seasonId })),
    queryClient.fetchQuery(yieldByVarietyOptions({ ...base, seasonId: compareSeasonId })),
    queryClient.fetchQuery(damageByLocationOptions({ ...base, seasonId })),
    queryClient.fetchQuery(damageByLocationOptions({ ...base, seasonId: compareSeasonId })),
    queryClient.fetchQuery(damageByCauseOptions({ ...base, seasonId })),
    queryClient.fetchQuery(damageByCauseOptions({ ...base, seasonId: compareSeasonId })),
  ]);

  const ylLocations = new Set([
    ...ylCurrent.ranking.map((r: any) => r.location),
    ...ylCompare.ranking.map((r: any) => r.location),
  ]);
  const yieldLocationData = Array.from(ylLocations).map(loc => ({
    location: loc,
    current: ylCurrent.ranking.find((r: any) => r.location === loc)?.yield ?? 0,
    compare: ylCompare.ranking.find((r: any) => r.location === loc)?.yield ?? 0,
  }));
  const yieldLocationStats = {
    primary: {
      avg: ylCurrent.average_yield,
      highest: ylCurrent.highest_yield?.value,
      highestLocation: ylCurrent.highest_yield?.location,
      lowest: ylCurrent.lowest_yield?.value,
      lowestLocation: ylCurrent.lowest_yield?.location,
      gap: ylCurrent.gap_percentage,
    },
    compare: {
      avg: ylCompare.average_yield,
      highest: ylCompare.highest_yield?.value,
      highestLocation: ylCompare.highest_yield?.location,
      lowest: ylCompare.lowest_yield?.value,
      lowestLocation: ylCompare.lowest_yield?.location,
      gap: ylCompare.gap_percentage,
    },
  };

  const ALL_METHODS = ['direct-seeded', 'transplanted'];
  const yieldMethodData = ALL_METHODS.map(method => ({
    method,
    current: ymCurrent.ranking?.find((r: any) => r.method === method)?.yield ?? 0,
    compare: ymCompare.ranking?.find((r: any) => r.method === method)?.yield ?? 0,
  }));
  const yieldMethodStats = {
    primary: {
      avg: ymCurrent.average_yield,
      highest: ymCurrent.highest_method?.value,
      highestMethod: ymCurrent.highest_method?.method,
      lowest: ymCurrent.lowest_method?.value,
      lowestMethod: ymCurrent.lowest_method?.method,
      gap: ymCurrent.gap_percentage,
    },
    compare: {
      avg: ymCompare.average_yield,
      highest: ymCompare.highest_method?.value,
      highestMethod: ymCompare.highest_method?.method,
      lowest: ymCompare.lowest_method?.value,
      lowestMethod: ymCompare.lowest_method?.method,
      gap: ymCompare.gap_percentage,
    },
  };
  const yieldMethodCompareRanking = ymCompare.ranking;

  const yvVarieties = new Set([
    ...yvCurrent.ranking.map((r: any) => r.variety),
    ...yvCompare.ranking.map((r: any) => r.variety),
  ]);
  const yieldVarietyData = Array.from(yvVarieties).map(variety => ({
    variety,
    current: yvCurrent.ranking.find((r: any) => r.variety === variety)?.yield ?? 0,
    compare: yvCompare.ranking.find((r: any) => r.variety === variety)?.yield ?? 0,
  }));
  const yieldVarietyStats = {
    primary: {
      avg: yvCurrent.average_yield,
      highest: yvCurrent.highest_variety?.value,
      highestVariety: yvCurrent.highest_variety?.variety,
      totalVarieties: yvCurrent.ranking.length,
    },
    compare: {
      avg: yvCompare.average_yield,
      highest: yvCompare.highest_variety?.value,
      highestVariety: yvCompare.highest_variety?.variety,
      totalVarieties: yvCompare.ranking.length,
    },
  };

  const dlLocations = new Set([
    ...dlCurrent.ranking.map((r: any) => r.location),
    ...dlCompare.ranking.map((r: any) => r.location),
  ]);
  const damageLocationData = Array.from(dlLocations).map(location => ({
    location,
    current: dlCurrent.ranking.find((r: any) => r.location === location)?.total_affected_area ?? 0,
    compare: dlCompare.ranking.find((r: any) => r.location === location)?.total_affected_area ?? 0,
  }));
  const damageLocationStats = {
    primary: {
      totalReports: dlCurrent.total_damage_reports,
      totalArea: dlCurrent.total_affected_area_ha,
      locationsCount: dlCurrent.ranking.length,
      avgArea: dlCurrent.total_affected_area_ha / (dlCurrent.ranking.length || 1),
    },
    compare: {
      totalReports: dlCompare.total_damage_reports,
      totalArea: dlCompare.total_affected_area_ha,
      locationsCount: dlCompare.ranking.length,
      avgArea: dlCompare.total_affected_area_ha / (dlCompare.ranking.length || 1),
    },
  };

  const dcCauses = new Set([
    ...dcCurrent.ranking.map((r: any) => r.cause),
    ...dcCompare.ranking.map((r: any) => r.cause),
  ]);
  const damageCauseData = Array.from(dcCauses).map(cause => ({
    cause,
    current: dcCurrent.ranking.find((r: any) => r.cause === cause)?.total_affected_area ?? 0,
    compare: dcCompare.ranking.find((r: any) => r.cause === cause)?.total_affected_area ?? 0,
  }));
  const damageCauseStats = {
    primary: {
      totalReports: dcCurrent.total_damage_reports,
      totalArea: dcCurrent.total_affected_area_ha,
      causesCount: dcCurrent.ranking.length,
      avgArea: dcCurrent.total_affected_area_ha / (dcCurrent.ranking.length || 1),
    },
    compare: {
      totalReports: dcCompare.total_damage_reports,
      totalArea: dcCompare.total_affected_area_ha,
      causesCount: dcCompare.ranking.length,
      avgArea: dcCompare.total_affected_area_ha / (dcCompare.ranking.length || 1),
    },
  };

  return {
    compareSeasonId,
    yieldLocation: { data: yieldLocationData, comparisonStats: yieldLocationStats },
    yieldMethod: { data: yieldMethodData, comparisonStats: yieldMethodStats, compareRanking: yieldMethodCompareRanking },
    yieldVariety: { data: yieldVarietyData, comparisonStats: yieldVarietyStats },
    damageLocation: { data: damageLocationData, comparisonStats: damageLocationStats },
    damageCause: { data: damageCauseData, comparisonStats: damageCauseStats },
  };
}


function buildComparisonMap(
  results: SeasonComparisonResult[]
): Record<ComparativeView, { data: any[]; stats: any[]; compareRanking?: any[] }> {
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


function useComparisonResults(
  compareSeasonIds: number[],
  filters: ComparisonFilters,
  queryClient: ReturnType<typeof useQueryClient>
): { results: SeasonComparisonResult[]; isLoading: boolean } {
  const [results, setResults] = useState<SeasonComparisonResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Stable serialised key so the effect only re-runs when something actually changed
  const filtersKey = JSON.stringify({ compareSeasonIds, filters });
  const prevKey = useRef<string>('');

  useEffect(() => {
    if (compareSeasonIds.length === 0) {
      setResults([]);
      setIsLoading(false);
      prevKey.current = filtersKey;
      return;
    }

    // Skip if nothing changed (avoids a redundant fetch when parent re-renders for unrelated reasons)
    if (prevKey.current === filtersKey) return;
    prevKey.current = filtersKey;

    let cancelled = false;
    setIsLoading(true);

    Promise.all(
      compareSeasonIds.map(compareSeasonId =>
        fetchSeasonComparison(queryClient, { ...filters, compareSeasonId })
      )
    ).then(fetched => {
      if (!cancelled) {
        setResults(fetched);
        setIsLoading(false);
      }
    }).catch(() => {
      if (!cancelled) setIsLoading(false);
    });

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtersKey]);

  return { results, isLoading };
}


function useSeasonLabels(ids: number[]): string[] {
  const { options } = useSeasonsForSelector();
  return useMemo(
    () => ids.map(id => options?.find(o => Number(o.value) === id)?.label ?? String(id)),
    [ids, options]
  );
}


const EMPTY_IDS: number[] = [];

function RouteComponent() {
  const { seasonId, compareSeasonIds } = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });

  const [view, setView] = useState<ComparativeView>('yield-location');
  const [moreFilters, setMoreFilters] = useState<MoreFilters>({ variety: [], method: [] });

  const { location, setProvince, setMunicipality, setBarangay, resetLocation } = useLocationHierarchy();
  const { data: availableLocations, isLoading: locationsLoading } = useAvailableLocations(seasonId);

  const provinceOptions = useMemo(() =>
    availableLocations?.provinces.map(name => ({ value: name, label: name })) ?? [],
    [availableLocations]
  );

  const municipalityOptions = useMemo(() => {
    if (!availableLocations) return [];
    let filtered = availableLocations.municipalities;
    if (location.province) filtered = filtered.filter(m => m.province === location.province);
    return filtered.map(m => ({ value: m.name, label: m.name }));
  }, [availableLocations, location.province]);

  const barangayOptions = useMemo(() => {
    if (!availableLocations) return [];
    let filtered = availableLocations.barangays;
    if (location.municipality) filtered = filtered.filter(b => b.municipality === location.municipality);
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

  const sharedFilters = useMemo<ComparisonFilters>(() => ({
    seasonId,
    province: location.province || undefined,
    municipality: location.municipality || undefined,
    barangay: location.barangay || undefined,
    method: moreFilters.method.length === 1 ? moreFilters.method[0] : undefined,
    variety: moreFilters.variety.length === 1 ? moreFilters.variety[0] : undefined,
  }), [seasonId, location, moreFilters]);

  const { byLocation: yieldByLocation, byMethod, byVariety } = useYieldComparativeData(sharedFilters);
  const { byLocation: damageByLocation, byCause: damageByCause } = useDamageAnalytics(sharedFilters);

  const stableCompareIds = compareSeasonIds ?? EMPTY_IDS;
  const queryClient = useQueryClient();
  const { results: comparisonResults, isLoading: comparisonLoading } =
    useComparisonResults(stableCompareIds, sharedFilters, queryClient);

  const comparisonMap = useMemo(() => buildComparisonMap(comparisonResults), [comparisonResults]);

  const currentSeasonLabel = useSeasonLabel(seasonId);
  const compareSeasonLabels = useSeasonLabels(stableCompareIds);

  const prefetchLocationData = useCallback((province?: string, municipality?: string, barangay?: string) => {
    if (!province && !municipality && !barangay) return;
    const p = { ...sharedFilters, province, municipality, barangay };
    queryClient.prefetchQuery(yieldByLocationOptions(p));
    queryClient.prefetchQuery(yieldByMethodOptions(p));
    queryClient.prefetchQuery(yieldByVarietyOptions(p));
    queryClient.prefetchQuery(damageByLocationOptions(p));
    queryClient.prefetchQuery(damageByCauseOptions(p));
  }, [sharedFilters, queryClient]);

  const prefetchWithFilters = useCallback((method?: string, variety?: string) => {
    const p = { ...sharedFilters, method: method ?? sharedFilters.method, variety: variety ?? sharedFilters.variety };
    queryClient.prefetchQuery(yieldByLocationOptions(p));
    queryClient.prefetchQuery(yieldByMethodOptions(p));
    queryClient.prefetchQuery(yieldByVarietyOptions(p));
    queryClient.prefetchQuery(damageByLocationOptions(p));
    queryClient.prefetchQuery(damageByCauseOptions(p));
  }, [sharedFilters, queryClient]);

  const resetAll = () => {
    setView('yield-location');
    resetLocation();
    setMoreFilters({ variety: [], method: [] });
  };

  const handleCompareSeasonIdsChange = (newIds: number[]) => {
    navigate({
      search: (prev) => ({ ...prev, compareSeasonIds: newIds.length > 0 ? newIds : undefined }),
      replace: true,
    });
  };

  const handleClearComparison = () => {
    navigate({ search: (prev) => ({ ...prev, compareSeasonIds: undefined }), replace: true });
  };

  const viewData = {
    'yield-location': yieldByLocation.data,
    'yield-method': byMethod.data,
    'yield-variety': byVariety.data,
    'damage-location': damageByLocation.data,
    'damage-cause': damageByCause.data,
  };

  const viewLoading = {
    'yield-location': yieldByLocation.isLoading,
    'yield-method': byMethod.isLoading,
    'yield-variety': byVariety.isLoading,
    'damage-location': damageByLocation.isLoading,
    'damage-cause': damageByCause.isLoading,
  };

  const activeData = viewData[view];
  const isLoading = viewLoading[view] ?? false;
  const ViewComponent = comparativeViewMap[view];

  const level = useMemo(() => {
    if (location.municipality) return 'barangay';
    if (location.province) return 'municipality';
    return 'province';
  }, [location]);

  if (isLoading || !activeData) return <PendingComponent />;

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
          isLoading={isLoading || comparisonLoading}
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
