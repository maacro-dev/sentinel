import { createFileRoute } from "@tanstack/react-router";
import { StatCard } from "@/features/analytics/components";
import { dataCollectionTrendOptions, formCountSummaryOptions, formProgressSummaryOptions } from "@/features/analytics/queries/options";
import { DataCollectionTrendChart } from "@/features/analytics/components/DataCollectionTrendChart";
import { Stat } from "@/features/analytics/types";
import { useFormOverview } from "@/features/analytics/hooks/useFormOverview";
import { FormCountBarChart } from "@/features/analytics/components/FormCountBarChart";
import { PageContainer } from "@/core/components/layout";
import { createCrumbLoader } from "@/core/utils/breadcrumb";
import PlaceholderBody from "@/core/components/PlaceholderBody";

export const Route = createFileRoute('/_manager/_analytics/forms-analytics')({
  component: RouteComponent,
  head: () => ({ meta: [{ title: "Forms | Humay" }] }),
  loaderDeps: ({ search: { seasonId } }) => ({ seasonId }),
  loader: ({ context: { queryClient }, deps: { seasonId } }) => {
    const sid = seasonId === "all" ? null : seasonId;

    if (sid === undefined) {
      return { breadcrumb: createCrumbLoader({ label: "Forms" }) }
    }

    queryClient.ensureQueryData(dataCollectionTrendOptions(sid))
    queryClient.ensureQueryData(formCountSummaryOptions(sid))
    queryClient.ensureQueryData(formProgressSummaryOptions(sid))

    return { breadcrumb: createCrumbLoader({ label: "Forms" }) }
  },
})


function RouteComponent() {

  const { seasonId } = Route.useSearch()
  const effectiveSeasonId = seasonId === "all" ? null : seasonId;

  const { formCount, formProgress, collectionTrend, isLoading } = useFormOverview(effectiveSeasonId);

  if (isLoading || !formCount || !formProgress || !collectionTrend) {
    return (
      <PageContainer>
        <PlaceholderBody />
      </PageContainer>
    );
  }

  return (
    <PageContainer className="flex-col lg:flex-row">
      <div className="flex-2 flex flex-row lg:flex-col gap-4">
        {formProgress.map((stat: Stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>
      <div className="flex-5 flex flex-row lg:flex-col gap-4">
        <DataCollectionTrendChart data={collectionTrend} />
        <FormCountBarChart data={formCount} />
      </div>
    </PageContainer>
  );
}
