import { PageContainer } from '@/core/components/layout';
import { Spinner } from '@/core/components/ui/spinner';
import { createCrumbLoader } from '@/core/utils/breadcrumb';
import { comparativeViewMap, MoreFilters } from '@/features/analytics/comparative';
import { ComparativeToolbar } from '@/features/analytics/components/ComparativeToolbar';
import { useYieldComparativeData } from '@/features/analytics/hooks/useYieldAnalytics';
import { yieldByLocationOptions, yieldByMethodOptions, yieldByVarietyOptions } from '@/features/analytics/queries/options';
import { ComparativeView } from '@/features/analytics/types';
import { useLocationHierarchy } from '@/features/mfid/hooks/useLgu';
import { useQueryClient } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { useCallback, useMemo, useState } from 'react';


export const Route = createFileRoute("/_manager/_analytics/comparative")({
  component: RouteComponent,
  loaderDeps: ({ search: { seasonId } }) => ({ seasonId }),
  loader: async ({ context: { queryClient }, deps: { seasonId } }) => {
    queryClient.ensureQueryData(yieldByLocationOptions({ seasonId, province: undefined, municipality: undefined, barangay: undefined, method: undefined, variety: undefined }))
    queryClient.ensureQueryData(yieldByMethodOptions({ seasonId, province: undefined, municipality: undefined, barangay: undefined, method: undefined, variety: undefined }))
    queryClient.ensureQueryData(yieldByVarietyOptions({ seasonId, province: undefined, municipality: undefined, barangay: undefined, method: undefined, variety: undefined }))

    return { breadcrumb: createCrumbLoader({ label: "Comparative Analytics" }) }
  },
  head: () => ({ meta: [{ title: "Comparative Analytics | Humay" }] }),
});


function RouteComponent() {
  const { seasonId } = Route.useSearch()

  const [view, setView] = useState<ComparativeView>('yield-location');

  const [moreFilters, setMoreFilters] = useState<MoreFilters>({ variety: [], method: [] });

  const {
    location,
    setProvince,
    setMunicipality,
    setBarangay,
    resetLocation,
    provinceOptions,
    municipalityOptions,
    barangayOptions,
    loadingProvinces,
    loadingMunicipalities,
    loadingBarangays,
  } = useLocationHierarchy();

  const handleLocationChange = (key: keyof typeof location, value: string) => {
    if (key === 'province') setProvince(value);
    else if (key === 'municipality') setMunicipality(value);
    else if (key === 'barangay') setBarangay(value);
  };

  const handleMoreFiltersChange = (key: keyof typeof moreFilters, value: string[]) => {
    setMoreFilters(prev => ({ ...prev, [key]: value }));
  };

  const { byLocation, byMethod, byVariety } = useYieldComparativeData({
    seasonId: seasonId,
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
  }, [seasonId, moreFilters, queryClient]);


  const resetAll = () => {
    setView('yield-location');
    resetLocation();
    setMoreFilters({ variety: [], method: [] });
  };

  const viewData = {
    'yield-location': byLocation.data,
    'yield-method': byMethod.data,
    'yield-variety': byVariety.data,
    'damage-location': undefined,
    'damage-cause': undefined
  };

  const viewLoading = {
    'yield-location': byLocation.isLoading,
    'yield-method': byMethod.isLoading,
    'yield-variety': byVariety.isLoading,
    'damage-location': false,
    'damage-cause': false
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
        isLoadingProvinces={loadingProvinces}
        isLoadingMunicipalities={loadingMunicipalities}
        isLoadingBarangays={loadingBarangays}
        prefetchLocationData={prefetchLocationData}
      />

      <ViewComponent
        data={activeData}
        isLoading={isLoading}
        {...(view === 'yield-location' ? { level } : {})}
      />
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
