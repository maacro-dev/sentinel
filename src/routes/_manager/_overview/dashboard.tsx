import { createFileRoute } from "@tanstack/react-router";
import { useAnalyticsDashboard } from "@/features/analytics/hooks/useDashboard";
import { dashboardDataOptions } from "@/features/analytics/queries/options";
import { StatCard } from "@/features/analytics/components/StatCard";
import { DashboardSkeleton } from "@/features/dashboard/components/DashboardSkeleton";
import { PageContainer } from "@/core/components/layout";
import { createCrumbLoader } from "@/core/utils/breadcrumb";
import { ExpandableStatCard } from "@/features/analytics/components/ExpandableStatCard";
import { BarangayYieldBarChart } from "@/features/analytics/components/BarangayYieldRankChart";

export const Route = createFileRoute("/_manager/_overview/dashboard")({
  loaderDeps: ({ search: { seasonId } }) => ({ seasonId }),
  loader: async ({ context: { queryClient }, deps: { seasonId } }) => {
    queryClient.ensureQueryData(dashboardDataOptions(seasonId));
    return { breadcrumb: createCrumbLoader({ label: "Dashboard" }) }
  },
  head: () => ({ meta: [{ title: "Dashboard | Humay" }] }),
  component: RouteComponent,
});

function RouteComponent() {

  const { seasonId } = Route.useSearch()
  const { stats, trends, ranks, isLoading } = useAnalyticsDashboard(seasonId);

  if (isLoading || !stats || !trends || !ranks) {
    return <PendingComponent />
  }

  const normalizedStats = stats.map((s) => {
    const current = Number(s.current_value);
    const percent = s.percent_change;

    const isMissingPrevious =
      percent === 100 && current !== 0 ||
      percent === 0 && current === 0;

    return {
      ...s,
      percent_change: isMissingPrevious ? undefined : percent,
    };
  });

  return (
    <PageContainer>
      <div className="grid auto-rows-min gap-4 md:grid-cols-4">
        {normalizedStats.map((stat) => (
          <ExpandableStatCard
            key={stat.title}
            statCard={
              <StatCard key={stat.title} {...stat} />
            }
          />
        ))}
      </div>
      <div className="flex gap-4">
        <BarangayYieldBarChart
          data={ranks}
          title="Barangay Yield Summary"
          description="Average yield per barangay"
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
