import { Layout } from "@/core/components/layout";
import { Session } from "@/features/authentication";
import { Outlet, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_manager")({
  beforeLoad: async () => await Session.ensure({ role: "data_manager"}),
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <Layout role="data_manager">
      <Outlet />
    </Layout>
  );
}
