import { createFileRoute } from "@tanstack/react-router";
import { StatCard } from "@/features/analytics/components";
import { dataCollectionTrendOptions, formCountSummaryOptions } from "@/features/analytics/queries/options";
import { DataCollectionTrendChart } from "@/features/analytics/components/DataCollectionTrendChart";
import { Stat } from "@/features/analytics/types";
import { useFormOverview } from "@/features/analytics/hooks/useFormOverview";
import { FormCountBarChart } from "@/features/analytics/components/FormCountBarChart";
import { PageContainer } from "@/core/components/layout";
import { createCrumbLoader } from "@/core/utils/breadcrumb";
import { FormInput } from "lucide-react";
import PlaceholderBody from "@/core/components/PlaceholderBody";

export const Route = createFileRoute("/_manager/forms/overview")({
  component: RouteComponent,
  head: () => ({ meta: [{ title: "Overview | Humay" }] }),
  loader: ({ context: { queryClient } }) => {
    queryClient.ensureQueryData(dataCollectionTrendOptions())
    queryClient.ensureQueryData(formCountSummaryOptions())
    return { breadcrumb: createCrumbLoader({ label: "Overview" }) }
  },
  staticData: {
    role: "data_manager",
    label: "Overview",
    sidebar: {
      order: 0,
      icon: FormInput,
    },
  }
});


function RouteComponent() {


  const { formCount, formProgress, collectionTrend, isLoading } = useFormOverview();

  if (isLoading || !formCount || !formProgress || !collectionTrend) {
    return (
      <PageContainer>
        <PlaceholderBody />
        {/* <Card className="h-full">
          <CardContent className="flex-1 flex items-center justify-center">
            <p className="text-muted-foreground">Loading...</p>
          </CardContent>
        </Card> */}
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
