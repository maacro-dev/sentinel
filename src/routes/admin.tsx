import { createFileRoute, Outlet } from "@tanstack/react-router";
import { Session } from "@/features/authentication";
import { Layout } from "@/core/components/layout";

export const Route = createFileRoute("/admin")({
  beforeLoad: async () => await Session.ensure({ role: "admin"}),
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <Layout role="admin">
      <Outlet />
    </Layout>
  );
}
