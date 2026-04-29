import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useState } from "react";
import { PageContainer } from "@/core/components/layout";
import { descriptiveAnalyticsDataOptions } from "@/features/analytics/queries/options";
import { createCrumbLoader } from "@/core/utils/breadcrumb";
import { useDescriptiveAnalytics } from "@/features/analytics/hooks/useDescriptiveAnalytics";
import { ProvinceYieldsBarChart } from "@/features/analytics/components/ProvinceYieldsBarChart";
import { Spinner } from "@/core/components/ui/spinner";
import { FertilizerTypeBarChart } from "@/features/analytics/components/FertilizerTypeBarChart";
import { MethodPieChart } from "@/features/analytics/components/MethodPieChart";
import { VarietyPieChart } from "@/features/analytics/components/VarietyPieChart";
import { useQueryClient } from "@tanstack/react-query";
import { Analytics } from "@/features/analytics/services/Analytics";

export const Route = createFileRoute("/_manager/_analytics/descriptive")({
  component: RouteComponent,
  loaderDeps: ({ search: { seasonId } }) => ({ seasonId }),
  loader: async ({ context: { queryClient }, deps: { seasonId } }) => {
    queryClient.ensureQueryData(descriptiveAnalyticsDataOptions(seasonId));
    return { breadcrumb: createCrumbLoader({ label: "Descriptive Analytics" }) };
  },
  head: () => ({ meta: [{ title: "Descriptive Analytics | Humay" }] }),
});

function RouteComponent() {
  const { seasonId } = Route.useSearch();
  const queryClient = useQueryClient();

  const [filter, setFilter] = useState<{
    province: string | null;
    municipality: string | null;
    barangay: string | null;
    method: string | undefined;
    variety: string | undefined;
    fertilizer: string | undefined;
  }>({
    province: null,
    municipality: null,
    barangay: null,
    method: undefined,
    variety: undefined,
    fertilizer: undefined
  });

  const prefetchForFertiliser = useCallback(
    (fertiliser: string) => {
      const targetFilter = { ...filter, fertilizer: fertiliser };
      queryClient.prefetchQuery(
        descriptiveAnalyticsDataOptions(seasonId, targetFilter)
      );
      queryClient.prefetchQuery({
        queryKey: ["hierarchical-yields", seasonId, filter.variety, fertiliser],
        queryFn: () =>
          Analytics.getHierarchicalYields(seasonId, filter.variety, fertiliser, filter.method),
      });
    },
    [queryClient, filter, seasonId]
  );

  const prefetchForVariety = useCallback(
    (variety: string) => {
      const targetFilter = { ...filter, variety };
      queryClient.prefetchQuery(descriptiveAnalyticsDataOptions(seasonId, targetFilter));
      queryClient.prefetchQuery({
        queryKey: ["hierarchical-yields", seasonId, variety, filter.fertilizer],
        queryFn: () =>
          Analytics.getHierarchicalYields(seasonId, variety, filter.fertilizer, filter.method),
      });
    },
    [queryClient, filter, seasonId]
  );

  const prefetchForMethod = useCallback(
    (method: string) => {
      const targetFilter = { ...filter, method };
      queryClient.prefetchQuery(descriptiveAnalyticsDataOptions(seasonId, targetFilter));
      queryClient.prefetchQuery({
        queryKey: ["hierarchical-yields", seasonId, filter.variety, filter.fertilizer, method],
        queryFn: () =>
          Analytics.getHierarchicalYields(seasonId, filter.variety, filter.fertilizer, method),
      });
    },
    [queryClient, filter, seasonId]
  );

  const { methodSummary, riceVarietySummary, fertilizerTypeSummary, isLoading, } = useDescriptiveAnalytics(seasonId, filter);

  if (isLoading || !methodSummary || !riceVarietySummary || !fertilizerTypeSummary) {
    return <PendingComponent />;
  }

  return (
    <PageContainer>
      <ProvinceYieldsBarChart
        seasonId={seasonId}
        variety={filter.variety}
        fertilizer={filter.fertilizer}
        onFilterChange={(geo) => setFilter(prev => ({ ...prev, ...geo }))}
      />
      <div className="flex h-full gap-4">
        <div className="h-full w-[60%]">
          <FertilizerTypeBarChart
            data={fertilizerTypeSummary}
            activeFertilizer={filter.fertilizer}
            onFertilizerChange={(f) =>
              setFilter(prev => ({ ...prev, fertilizer: f }))
            }
            onBarHover={(item) => {
              if (item?.type) prefetchForFertiliser(item.type);
            }}
          />
        </div>
        <div className="flex flex-col gap-4 w-full">
          <MethodPieChart
            summary={methodSummary}
            activeMethod={filter.method}
            onMethodChange={(m) => setFilter(prev => ({ ...prev, method: m }))}
            onSliceHover={(method) => prefetchForMethod(method)}
          />
          <VarietyPieChart
            summary={riceVarietySummary}
            activeVariety={filter.variety}
            onVarietyChange={(v) => setFilter(prev => ({ ...prev, variety: v }))}
            onSliceHover={(variety) => prefetchForVariety(variety)}
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
