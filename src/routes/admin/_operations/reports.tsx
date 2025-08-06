import { PageContainer } from "@/core/components/layout";
import PlaceholderBody from "@/core/components/PlaceholderBody";
import { createCrumbLoader } from "@/core/utils/breadcrumb";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/_operations/reports")({
  component: RouteComponent,
  loader: () => {
    return { breadcrumb: createCrumbLoader({ label: "System Reports" }) }
  },
  head: () => ({
    meta: [{ title: "Reports | Humay" }],
  }),
});

function RouteComponent() {
  return (
    <PageContainer>
      <PlaceholderBody />
    </PageContainer>
  )
}
