import { PageContainer } from "@/core/components/layout";
import PlaceholderBody from "@/core/components/PlaceholderBody";
import { createCrumbLoader } from "@/core/utils/breadcrumb";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/_overview/dashboard")({
  component: RouteComponent,
  loader: () => {
    return { breadcrumb: createCrumbLoader({ label: "Dashboard" }) }
  },
  head: () => ({
    meta: [{ title: "Admin Dashboard | Humay" }],
  }),
});

function RouteComponent() {
  return (
    <PageContainer>
      <PlaceholderBody />
    </PageContainer>
  );
}
