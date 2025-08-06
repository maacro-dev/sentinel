import { PageContainer } from "@/core/components/layout";
import PlaceholderBody from "@/core/components/PlaceholderBody";
import { createCrumbLoader } from "@/core/utils/breadcrumb";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/admin/_accessControl/security")({
  component: RouteComponent,
  loader: () => {
    return { breadcrumb: createCrumbLoader({ label: "System Security" }) }
  },
  head: () => ({
    meta: [{ title: "System Security | Humay" }],
  }),
});

function RouteComponent() {
  return (
    <PageContainer>
      <PlaceholderBody />
    </PageContainer>
  );
}
