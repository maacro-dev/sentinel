import * as z from "zod/v4"
import { PageContainer } from '@/core/components/layout';
import { Spinner } from '@/core/components/ui/spinner';
import { createCrumbLoader } from '@/core/utils/breadcrumb';
import { ComparativeToolbar } from '@/features/analytics/components/ComparativeToolbar';
import {
  damageByCauseOptions,
  damageByLocationOptions,
  yieldByLocationOptions,
  yieldByMethodOptions,
  yieldByVarietyOptions,
} from '@/features/analytics/queries/options';
import { ComparativeView } from '@/features/analytics/types';
import { useQueryClient } from '@tanstack/react-query';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';
import { useComparativeLocation } from "@/features/analytics/hooks/useComparativeLocation";
import { useComparativeFilters } from "@/features/analytics/hooks/useComparativeFilters";
import { useComparativeData } from "@/features/analytics/hooks/useComparativeData";
import { useSeasonComparison } from "@/features/analytics/hooks/useSeasonComparison";
import { YieldByLocationView } from "@/features/analytics/views/YieldByLocationView";
import { useComparativePrefetch } from "@/features/analytics/hooks/useComparativePrefetch";
import { YieldByMethodView } from "@/features/analytics/views/YieldByMethodView";
import { YieldByVarietyView } from "@/features/analytics/views/YieldByVarietyView";
import { DamageByLocationView } from "@/features/analytics/views/DamageByLocationView";
import { DamageByCauseView } from "@/features/analytics/views/DamageByCauseView";

export const Route = createFileRoute("/_manager/_analytics/comparative")({
  component: RouteComponent,
  validateSearch: z.object({
    compareSeasonIds: z
      .union([
        z.string().transform(s => s.split(',').map(Number).filter(n => !isNaN(n) && n > 0)),
        z.array(z.coerce.number()),
      ])
      .optional()
      .default([]),
  }),
  loaderDeps: ({ search: { seasonId } }) => ({ seasonId }),
  loader: async ({ context: { queryClient }, deps: { seasonId } }) => {
    const sid = seasonId === "all" ? null : seasonId;
    const defaultParam = {
      seasonId: sid,
      province: undefined,
      municipality: undefined,
      barangay: undefined,
      method: undefined,
      variety: undefined,
    };
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
  const { seasonId, compareSeasonIds } = Route.useSearch();

  const [view, setView] = useState<ComparativeView>('yield-location');
  const navigate = useNavigate({ from: Route.fullPath });
  const queryClient = useQueryClient();

  const effectiveSeasonId = seasonId === "all" ? null : (seasonId ?? undefined);
  const normalizedSeasonId = seasonId === undefined ? null : seasonId;

  const {
    location, resetLocation,
    provinceOptions, municipalityOptions, barangayOptions,
    handleProvinceSelect, handleMunicipalitySelect,
    handleLocationChange,
    level,
    isLoading: locationsLoading,
  } = useComparativeLocation(effectiveSeasonId);


  const {
    moreFilters,
    handleMoreFiltersChange,
    sharedFilters,
    resetMoreFilters,
  } = useComparativeFilters(effectiveSeasonId, location);

  const prefetchLineData = useComparativePrefetch(sharedFilters, level);

  const {
    sortedCompareIds,
    comparisonMap,
    comparisonLoading,
    currentSeasonLabel,
    compareSeasonLabels,
    setCompareIds,
    clearCompare,
  } = useSeasonComparison(normalizedSeasonId, compareSeasonIds ?? [], sharedFilters, queryClient, navigate);

  const { viewData, viewLoading } = useComparativeData(sharedFilters);

  const hasBaseData = !!viewData[view]
  const showInitialLoader = viewLoading[view] || (!hasBaseData && comparisonLoading);

  const resetAll = () => {
    setView('yield-location');
    resetLocation();
    resetMoreFilters();
  };

  const handleProvinceClear = () => handleLocationChange('province', '');
  const handleMunicipalityClear = () => handleLocationChange('municipality', '');

  if (showInitialLoader) return <PendingComponent />;

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
        compareSeasonIds={sortedCompareIds}
        onCompareSeasonIdsChange={setCompareIds}
        onClearComparison={clearCompare}
      />

      {view === 'yield-location' && (
        <YieldByLocationView
          data={viewData[view]}
          compareData={comparisonMap[view]?.data}
          isLoading={comparisonLoading && hasBaseData && sortedCompareIds.length > 0}
          currentSeasonLabel={currentSeasonLabel}
          compareSeasonLabels={compareSeasonLabels}
          comparisonStats={comparisonMap[view]?.stats}
          onYieldLineHover={prefetchLineData}
          onProvinceSelect={handleProvinceSelect}
          onProvinceClear={handleProvinceClear}
          onMunicipalityClear={handleMunicipalityClear}
          onMunicipalitySelect={handleMunicipalitySelect}
          level={level}
        />
      )}

      {view === 'yield-method' && (
        <YieldByMethodView
          data={viewData[view]}
          isLoading={comparisonLoading && hasBaseData && sortedCompareIds.length > 0}
          compareData={comparisonMap[view]?.data}
          currentSeasonLabel={currentSeasonLabel}
          compareSeasonLabels={compareSeasonLabels}
          comparisonStats={comparisonMap[view]?.stats}
        />
      )}

      {view === 'yield-variety' && (
        <YieldByVarietyView
          data={viewData[view]}
          isLoading={comparisonLoading && hasBaseData && sortedCompareIds.length > 0}
          compareData={comparisonMap[view]?.data}
          currentSeasonLabel={currentSeasonLabel}
          compareSeasonLabels={compareSeasonLabels}
          comparisonStats={comparisonMap[view]?.stats}
        />
      )}

      {view === 'damage-location' && (
        <DamageByLocationView
          data={viewData[view]}
          isLoading={comparisonLoading && hasBaseData && sortedCompareIds.length > 0}
          compareData={comparisonMap[view]?.data}
          currentSeasonLabel={currentSeasonLabel}
          compareSeasonLabels={compareSeasonLabels}
          comparisonStats={comparisonMap[view]?.stats}
        />
      )}

      {view === 'damage-cause' && (
        <DamageByCauseView
          data={viewData[view]}
          isLoading={comparisonLoading && hasBaseData && sortedCompareIds.length > 0}
          compareData={comparisonMap[view]?.data}
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
      </div>
    </PageContainer>
  );
}


