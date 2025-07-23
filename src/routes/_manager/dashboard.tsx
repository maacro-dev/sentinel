import { createFileRoute } from "@tanstack/react-router";
import { LayoutDashboard } from "lucide-react";
import { useAnalyticsDashboard } from "@/features/analytics/hooks/useAnalyticsDashboard";
import { dashboardDataOptions } from "@/features/analytics/queries/options";
import { StatCard } from "@/features/analytics/components/StatCard";
import { Motion } from "@/core/components/Motion";
import { DashboardStat } from "@/features/analytics/types";
import { DashboardSkeleton } from "@/features/dashboard/components/DashboardSkeleton";
import { BarangayYieldRankChart } from "@/features/analytics/components/BarangayYieldRankChart";
import { YieldTimeSeriesChart } from "@/features/analytics/components/YieldTimeSeries";
import { ScrollIndicator } from "@/core/components/ScrollIndicator";

export const Route = createFileRoute("/_manager/dashboard")({
  loader: ({ context: { queryClient } }) => {
    queryClient.ensureQueryData(dashboardDataOptions());
  },
  head: () => ({ meta: [{ title: "Dashboard | Humay" }] }),
  staticData: {
    routeFor: "data_manager",
    label: "Dashboard",
    icon: LayoutDashboard,
    group: "Overview",
    navItemOrder: 1,
  },
  component: RouteComponent,
});

function RouteComponent() {

  const { stats, trends, ranks, isLoading } = useAnalyticsDashboard();

  if (isLoading || !stats || !trends || !ranks) {
    return <DashboardSkeleton />;
  }

  return (
    <Motion className="gap-4">
      <div className="grid auto-rows-min gap-4 md:grid-cols-4">
        {stats.map((stat: DashboardStat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>
      <YieldTimeSeriesChart data={trends} />
      <div className="flex gap-4 pb-4">
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
      <ScrollIndicator />
    </Motion>
  );
}
