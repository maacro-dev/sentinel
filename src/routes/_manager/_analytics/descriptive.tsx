import { createFileRoute } from "@tanstack/react-router";
import { PageContainer } from "@/core/components/layout";
import { descriptiveAnalyticsDataOptions } from "@/features/analytics/queries/options";
import { createCrumbLoader } from "@/core/utils/breadcrumb";
import { useDescriptiveAnalytics } from "@/features/analytics/hooks/useDescriptiveAnalytics";
import { ProvinceYieldsBarChart } from "@/features/analytics/components/ProvinceYieldsBarChart";
import { Spinner } from "@/core/components/ui/spinner";

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
  const { provinceYields, isLoading } = useDescriptiveAnalytics(seasonId)

  if (isLoading || !provinceYields) {
    return <PendingComponent />
  }

  return (
    <PageContainer>
      <ProvinceYieldsBarChart data={provinceYields} />
      <p className="text-sm text-muted-foreground">More to be added...</p>
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
