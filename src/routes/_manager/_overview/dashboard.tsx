import { createFileRoute } from "@tanstack/react-router";
import { useAnalyticsDashboard } from "@/features/analytics/hooks/useDashboard";
import { dashboardDataOptions } from "@/features/analytics/queries/options";
import { StatCard } from "@/features/analytics/components/StatCard";
import { Stat } from "@/features/analytics/types";
import { DashboardSkeleton } from "@/features/dashboard/components/DashboardSkeleton";
import { BarangayYieldRankChart } from "@/features/analytics/components/BarangayYieldRankChart";
import { OverallYieldTrendChart } from "@/features/analytics/components/OverallYieldTrendChart";
import { PageContainer } from "@/core/components/layout";
import { createCrumbLoader } from "@/core/utils/breadcrumb";

export const Route = createFileRoute("/_manager/_overview/dashboard")({
  loader: ({ context: { queryClient } }) => {
    queryClient.ensureQueryData(dashboardDataOptions());


    return { breadcrumb: createCrumbLoader({ label: "Dashboard" }) }
  },
  head: () => ({ meta: [{ title: "Dashboard | Humay" }] }),
  component: RouteComponent,
  pendingComponent: PendingComponent,
  wrapInSuspense: true
});

function RouteComponent() {
  const { stats, trends, ranks } = useAnalyticsDashboard();

  return (
    <PageContainer>
      <div className="grid auto-rows-min gap-4 md:grid-cols-4">
        {stats.map((stat: Stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>
      <OverallYieldTrendChart data={trends} />
      <div className="flex gap-4">
        <BarangayYieldRankChart
          ranking="top"
          data={ranks.top}
          title="Top 3 Barangays by Yield"
          description="Barangays with the highest yield this season"
        />
        <BarangayYieldRankChart
          ranking="bottom"
          data={ranks.bottom}
          title="Bottom 3 Barangays by Yield"
          description="Barangays with the lowest yield this season"
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
