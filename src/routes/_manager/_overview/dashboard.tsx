import { createFileRoute } from "@tanstack/react-router";
import { useAnalyticsDashboard } from "@/features/analytics/hooks/useDashboard";
import { dashboardDataOptions } from "@/features/analytics/queries/options";
import { StatCard } from "@/features/analytics/components/StatCard";
import { Stat } from "@/features/analytics/types";
import { DashboardSkeleton } from "@/features/dashboard/components/DashboardSkeleton";
import { PageContainer } from "@/core/components/layout";
import { createCrumbLoader } from "@/core/utils/breadcrumb";
import { ExpandableStatCard } from "@/features/analytics/components/ExpandableStatCard";
import { BarangayYieldBarChart } from "@/features/analytics/components/BarangayYieldRankChart";
import { useNotifications } from "@/features/notifications/hooks/useNotification";

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

  const { notifications } = useNotifications()

  console.log("Notifications:", notifications)

  if (isLoading || !stats || !trends || !ranks) {
    return <PendingComponent />
  }

  return (
    <PageContainer>
      <div className="grid auto-rows-min gap-4 md:grid-cols-4">
        {stats.map((stat: Stat) => (
          <ExpandableStatCard
            key={stat.title}
            statCard={
              <StatCard key={stat.title} {...stat} />
            }
          />
        ))}
      </div>
      {/* <OverallYieldTrendChart data={trends} /> */}
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
