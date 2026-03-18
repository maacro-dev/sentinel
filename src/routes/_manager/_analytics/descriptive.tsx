import { createFileRoute } from "@tanstack/react-router";
import { PageContainer } from "@/core/components/layout";
import { descriptiveAnalyticsDataOptions } from "@/features/analytics/queries/options";
import { createCrumbLoader } from "@/core/utils/breadcrumb";
import { useDescriptiveAnalytics } from "@/features/analytics/hooks/useDescriptiveAnalytics";
import { ProvinceYieldsBarChart } from "@/features/analytics/components/ProvinceYieldsBarChart";
import { Spinner } from "@/core/components/ui/spinner";
import { MethodRadialChart } from "@/features/analytics/components/MethodRadialChart";
import { VarietyRadialChart } from "@/features/analytics/components/VarietyRadialChart";
import { FertilizerTypeBarChart } from "@/features/analytics/components/FertilizerTypeBarChart";

export const Route = createFileRoute("/_manager/_analytics/descriptive")({
  component: RouteComponent,
  loaderDeps: ({ search: { seasonId } }) => ({ seasonId }),
  loader: async ({ context: { queryClient }, deps: { seasonId } }) => {
    queryClient.ensureQueryData(descriptiveAnalyticsDataOptions(seasonId))
    return { breadcrumb: createCrumbLoader({ label: "Descriptive Analytics" }) }
  },
  head: () => ({ meta: [{ title: "Descriptive Analytics | Humay" }], }),
});

function RouteComponent() {

  const { seasonId } = Route.useSearch()
  const { provinceYields, methodSummary, riceVarietySummary, fertilizerTypeSummary, isLoading } = useDescriptiveAnalytics(seasonId);

  if (isLoading || !provinceYields || !methodSummary || !riceVarietySummary || !fertilizerTypeSummary) {
    return <PendingComponent />;
  }

  console.log("fertilizerTypeSummary =", fertilizerTypeSummary)

  return (
    <PageContainer>
      <ProvinceYieldsBarChart data={provinceYields} />
      <div className="flex h-full gap-4 ">

        <div className="h-full flex-5">
          <FertilizerTypeBarChart data={fertilizerTypeSummary} />
        </div>

        <div className="flex-2 flex flex-col gap-4">
          <MethodRadialChart summary={methodSummary} />
          <VarietyRadialChart summary={riceVarietySummary} />
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
