import { createFileRoute } from "@tanstack/react-router";
import { useAnalyticsDashboard } from "@/features/analytics/hooks/useDashboard";
import { dashboardDataOptions } from "@/features/analytics/queries/options";
import { StatCard } from "@/features/analytics/components/StatCard";
import { DashboardSkeleton } from "@/features/dashboard/components/DashboardSkeleton";
import { PageContainer } from "@/core/components/layout";
import { createCrumbLoader } from "@/core/utils/breadcrumb";
import { BarangayYieldBarChart } from "@/features/analytics/components/BarangayYieldRankChart";

export const Route = createFileRoute("/_manager/_overview/dashboard")({
  loaderDeps: ({ search: { seasonId } }) => ({ seasonId }),
  loader: async ({ context: { queryClient }, deps: { seasonId } }) => {
    const sid = seasonId === "all" ? null : seasonId;

    if (sid === undefined) {
      return { breadcrumb: createCrumbLoader({ label: "Dashboard" }) };
    }

    queryClient.ensureQueryData(dashboardDataOptions(sid));
    return { breadcrumb: createCrumbLoader({ label: "Dashboard" }) }
  },
  head: () => ({ meta: [{ title: "Dashboard | Humay" }] }),
  component: RouteComponent,
});

function RouteComponent() {

  const { seasonId } = Route.useSearch()
  const effectiveSeasonId = seasonId === "all" ? null : seasonId;

  const { stats, trends, ranks, isLoading } = useAnalyticsDashboard(effectiveSeasonId);

  if (isLoading || !stats || !trends || !ranks) {
    return <PendingComponent />
  }

  return (
    <PageContainer>
      <div className="grid auto-rows-min gap-4 md:grid-cols-4">
        {stats.map((stat) => {
          const { key: metricKey, ...rest } = stat;
          return <StatCard key={metricKey} {...rest} statKey={metricKey} />;
        })}
      </div>
      <div className="flex gap-4">
        <BarangayYieldBarChart
          data={ranks}
          title="Barangay Yield Summary"
          description="Average yield per barangay"
          itemCount={7}
        />
      </div>
    </PageContainer>
  );
}

function PendingComponent() {
  return (
    <PageContainer>
      <DashboardSkeleton />
    </PageContainer>
  );
}
