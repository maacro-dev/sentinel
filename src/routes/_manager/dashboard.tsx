import { createFileRoute } from "@tanstack/react-router";
import { LayoutDashboard, MoveDown, MoveUp } from "lucide-react";
import { lazy, Suspense } from "react";

import { FadeInDiv } from "@/components/animation";
import { Skeleton } from "@/components/ui/skeleton";
import { StatCard } from "@/components/stat-card";
import { BarangayYieldRank } from "@/components/barangay-yield-rank";

import { ensureManagerDashboardData } from "@/queries/dashboard";
import { useDashboardStats, useDashboardCharts } from "@/hooks/use-dashboard-data";
import { title } from "@/utils/string";
import { YIELD_CHART_CONFIG } from "@/app/config/chart";

const AreaChartDefault = lazy(async () => {
  const mod = await import("@/components/ui/area-chart");
  return { default: mod.AreaChartDefault };
});

export const Route = createFileRoute("/_manager/dashboard")({
  component: RouteComponent,
  loader: ({ context: { queryClient } }) => ensureManagerDashboardData(queryClient),
  head: () => ({ meta: [{ title: "Dashboard | Humay" }] }),
  staticData: {
    routeFor: "data_manager",
    label: "Dashboard",
    icon: LayoutDashboard,
    group: "Overview",
    navItemOrder: 1,
  },
});

function RouteComponent() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardStats />
      <DashboardChart />
    </Suspense>
  );
}

const DashboardSkeleton = () => (
  <FadeInDiv direction="none" duration={1} className="space-y-6 opacity-60">
    <div className="grid auto-rows-min gap-4 md:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <Skeleton key={i} className="max-h-48 min-h-40 w-full rounded" />
      ))}
    </div>
    <div className="space-y-4">
      <Skeleton className="h-72 w-full rounded-lg" />
      <div className="flex gap-4">
        <Skeleton className="h-72 w-full rounded-lg" />
        <Skeleton className="h-72 w-full rounded-lg" />
      </div>
    </div>
  </FadeInDiv>
);

const DashboardStats = () => {
  const { statData } = useDashboardStats();

  return (
    <FadeInDiv
      direction="none"
      duration={0.5}
      className="grid auto-rows-min gap-4 md:grid-cols-4"
    >
      {statData.map((data, i) => (
        <StatCard key={i} {...data} />
      ))}
    </FadeInDiv>
  );
};

const DashboardChart = () => {

  const {
    yieldData,
    topBarangayYield,
    bottomBarangayYield
  } = useDashboardCharts();

  return (
    <FadeInDiv direction="none" duration={0.5} className="space-y-4">
      <AreaChartDefault
        className="h-72"
        data={yieldData.map(({ month_year, avg_yield_t_ha }) => ({
          month_year: title(month_year),
          avg_yield_t_ha,
        }))}
        xDataKey="month_year"
        yDataKey="avg_yield_t_ha"
        title="Overall Yield Trend"
        description="Tracking average yield (t/ha) by month"
        config={YIELD_CHART_CONFIG}
      />
      <div className="flex gap-4">
        <BarangayYieldRank
          ranking="top"
          data={topBarangayYield}
          title="Top Performing Barangays"
          titleSuffix={<MoveUp className="size-4 text-humay"/>}
          description="Highest yield this season"
        />
        <BarangayYieldRank
          ranking="bottom"
          data={bottomBarangayYield}
          title="Bottom Performing Barangays"
          titleSuffix={<MoveDown className="size-4 text-red-500"/>}
          description="Lowest yield this season"
        />
      </div>
    </FadeInDiv>
  );
};
