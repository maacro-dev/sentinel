import { PageContainer } from "@/core/components/layout";
import PlaceholderBody from "@/core/components/PlaceholderBody";
import { createCrumbLoader } from "@/core/utils/breadcrumb";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/_configuration/settings")({
  component: RouteComponent,
  loader: () => {
    return { breadcrumb: createCrumbLoader({ label: "Settings" }) };
  },
  head: () => ({
    meta: [{ title: "Settings | Humay" }],
  }),
});

function RouteComponent() {
  return (
    <PageContainer>
      <PlaceholderBody />
    </PageContainer>
  );
}
