import { Layout } from "@/core/components/layout";
import { ManagerRealtimeListener } from "@/core/supabase/realtime";
import { analyticsSeasonSearchSchema } from "@/features/analytics/schemas/search.schema";
import { Session } from "@/features/authentication";
import { Seasons } from "@/features/fields/services/Seasons";
import { Outlet, createFileRoute, redirect, retainSearchParams } from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-adapter"

export const Route = createFileRoute("/_manager")({
  beforeLoad: async () => await Session.ensure({ role: "data_manager" }),
  validateSearch: zodValidator(analyticsSeasonSearchSchema),
  search: {
    middlewares: [retainSearchParams(['seasonId'])]
  },
  loader: async ({ location }) => {
    const search = location.search as Record<string, unknown>;
    if (search.seasonId !== undefined) return;

    const latest = await Seasons.getCurrent();
    if (latest) {
      const newSearch = { ...search, seasonId: latest };
      throw redirect({
        to: location.pathname,
        search: newSearch,
        replace: true,
      });
    }
  },
  component: RouteComponent,
});

function RouteComponent() {

  const { seasonId } = Route.useSearch()

  return (
    <Layout role="data_manager">
      <ManagerRealtimeListener seasonId={seasonId ?? 0} />
      <Outlet />
    </Layout>
  );
}
