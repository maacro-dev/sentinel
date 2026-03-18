import { Layout } from "@/core/components/layout";
import { ManagerRealtimeListener } from "@/core/supabase/realtime";
import { analyticsSeasonSearchSchema } from "@/features/analytics/schemas/search.schema";
import { Session } from "@/features/authentication";
import { Outlet, createFileRoute, retainSearchParams } from "@tanstack/react-router";
import { zodValidator } from "@tanstack/zod-adapter"

export const Route = createFileRoute("/_manager")({
  beforeLoad: async () => await Session.ensure({ role: "data_manager" }),
  validateSearch: zodValidator(analyticsSeasonSearchSchema),
  search: {
    middlewares: [retainSearchParams(['seasonId'])]
  },
  component: RouteComponent,
});

function RouteComponent() {

  const { seasonId } = Route.useSearch()

  return (
    <Layout role="data_manager">
      <ManagerRealtimeListener seasonId={seasonId ?? 0}/>
      <Outlet />
    </Layout>
  );
}
