import { createFileRoute } from "@tanstack/react-router";
import { StatCard } from "@/features/analytics/components";
import { dataCollectionTrendOptions, formCountSummaryOptions, formProgressSummaryOptions } from "@/features/analytics/queries/options";
import { DataCollectionTrendChart } from "@/features/analytics/components/DataCollectionTrendChart";
import { Stat } from "@/features/analytics/types";
import { useFormOverview } from "@/features/analytics/hooks/useFormOverview";
import { FormCountBarChart } from "@/features/analytics/components/FormCountBarChart";
import { PageContainer } from "@/core/components/layout";
import { createCrumbLoader } from "@/core/utils/breadcrumb";
import { FormInput } from "lucide-react";
import PlaceholderBody from "@/core/components/PlaceholderBody";
import { useSeason } from "@/features/fields/hooks/useSeasons";

export const Route = createFileRoute("/_manager/_overview/forms-overview")({
  component: RouteComponent,
  head: () => ({ meta: [{ title: "Data Collection | Humay" }] }),
  loaderDeps: ({ search: { seasonId } }) => ({ seasonId }),
  loader: ({ context: { queryClient }, deps: { seasonId } }) => {

    queryClient.ensureQueryData(dataCollectionTrendOptions(seasonId))
    queryClient.ensureQueryData(formCountSummaryOptions(seasonId))
    queryClient.ensureQueryData(formProgressSummaryOptions(seasonId))

    return { breadcrumb: createCrumbLoader({ label: "Data Collection" }) }
  },
  staticData: {
    role: "data_manager",
    label: "Data Collection",
    sidebar: {
      order: 0,
      icon: FormInput,
    },
  }
});

function RouteComponent() {

  const { seasonId } = Route.useSearch()
  const { data: season, isLoading: seasonLoading } = useSeason(seasonId)
  const { formCount, formProgress, collectionTrend, isLoading } = useFormOverview(seasonId);

  if (isLoading || !formCount || !formProgress || !collectionTrend || seasonLoading || !season) {
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
