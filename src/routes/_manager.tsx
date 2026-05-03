import { Layout } from "@/core/components/layout";
import { ManagerRealtimeListener } from "@/core/supabase/realtime";
import { analyticsSeasonSearchSchema } from "@/features/analytics/schemas/search.schema";
import { Session } from "@/features/authentication";
import { NotificationsRealtimeListener } from "@/features/notifications/components/NotificationsRealtimeListener";
import { Outlet, createFileRoute, redirect, retainSearchParams } from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-adapter"

export const Route = createFileRoute("/_manager")({
  beforeLoad: async ({ location }) => {
    await Session.ensure({ role: "data_manager" });
    const search = location.search as Record<string, unknown>;

    if (search.seasonId === undefined) {
      throw redirect({
        to: location.pathname,
        search: { ...search, seasonId: 'all' },
        replace: true,
      });
    }
  },
  validateSearch: zodValidator(analyticsSeasonSearchSchema),
  search: {
    middlewares: [retainSearchParams(['seasonId'])]
  },
  component: RouteComponent,
});

function RouteComponent() {

  const { seasonId } = Route.useSearch()
  const effectiveSeasonId = seasonId === 'all' ? undefined : seasonId;

  return (
    <Layout role="data_manager">
      <ManagerRealtimeListener seasonId={effectiveSeasonId ?? 0} />
      <NotificationsRealtimeListener />
      <Outlet />
    </Layout>
  );
}
