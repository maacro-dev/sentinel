import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageContainer } from "@/core/components/layout";
import { descriptiveAnalyticsDataOptions } from "@/features/analytics/queries/options";
import { createCrumbLoader } from "@/core/utils/breadcrumb";
import { useDescriptiveAnalytics } from "@/features/analytics/hooks/useDescriptiveAnalytics";
import { ProvinceYieldsBarChart } from "@/features/analytics/components/ProvinceYieldsBarChart";
import { Spinner } from "@/core/components/ui/spinner";
import { FertilizerTypeBarChart } from "@/features/analytics/components/FertilizerTypeBarChart";
import { MethodPieChart } from "@/features/analytics/components/MethodPieChart";
import { VarietyPieChart } from "@/features/analytics/components/VarietyPieChart";
import { DescriptiveFilters } from "@/features/analytics/types";
import { ActiveDescriptiveFiltersBar } from "@/features/analytics/components/ActiveDescriptiveFiltersBar";

export const Route = createFileRoute("/_manager/_analytics/descriptive")({
  component: RouteComponent,
  loaderDeps: ({ search: { seasonId } }) => ({ seasonId }),
  loader: async ({ context: { queryClient }, deps: { seasonId } }) => {
    const sid = seasonId === "all" ? null : seasonId;
    if (sid === undefined) {
      return { breadcrumb: createCrumbLoader({ label: "Descriptive Analytics" }) };
    }
    queryClient.ensureQueryData(descriptiveAnalyticsDataOptions(sid));
    return { breadcrumb: createCrumbLoader({ label: "Descriptive Analytics" }) };
  },
  head: () => ({ meta: [{ title: "Descriptive Analytics | Humay" }] }),
});

function RouteComponent() {
  const { seasonId } = Route.useSearch();
  const effectiveSeasonId = seasonId === "all" ? null : seasonId;

  const [filter, setFilter] = useState<DescriptiveFilters>({});

  const {
    methodSummary,
    riceVarietySummary,
    fertilizerTypeSummary,
    provinceYieldsHierarchy,
    isLoading,
    prefetch
  } = useDescriptiveAnalytics(effectiveSeasonId, filter);

  const clearFilter = (key: keyof DescriptiveFilters) => {
    setFilter(prev => ({ ...prev, [key]: undefined }));
  };

  const clearAllFilters = () => {
    setFilter({});
  };


  if (isLoading || !methodSummary || !riceVarietySummary || !fertilizerTypeSummary || !provinceYieldsHierarchy) {
    return <PendingComponent />;
  }

  return (
    <PageContainer>
      <ActiveDescriptiveFiltersBar filters={filter} onClear={clearFilter} onClearAll={clearAllFilters} />
      <ProvinceYieldsBarChart
        hierarchy={provinceYieldsHierarchy}
        locationFilter={{
          province: filter.province,
          municipality: filter.municipality,
          barangay: filter.barangay,
        }}
        onLocationFilterChange={(geo) => setFilter(prev => ({ ...prev, ...geo }))}
        onBarHover={(locFilter) => prefetch(locFilter)}
      />
      <div className="flex h-full gap-4">
        <div className="h-full w-[60%]">
          <FertilizerTypeBarChart
            data={fertilizerTypeSummary}
            activeFertilizer={filter.fertilizer}
            onFertilizerChange={(f) => setFilter(prev => ({ ...prev, fertilizer: f }))}
            onBarHover={(item) => { if (item?.type) prefetch({ fertilizer: item.type }); }}
          />
        </div>
        <div className="flex flex-col gap-4 w-full">
          <MethodPieChart
            summary={methodSummary}
            activeMethod={filter.method}
            onMethodChange={(m) => setFilter(prev => ({ ...prev, method: m }))}
            onSliceHover={(method) => prefetch({ method })}
          />
          <VarietyPieChart
            summary={riceVarietySummary}
            activeVariety={filter.variety}
            onVarietyChange={(v) => setFilter(prev => ({ ...prev, variety: v }))}
            onSliceHover={(variety) => prefetch({ variety })}
          />
        </div>
      </div>
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
