import { createFileRoute } from "@tanstack/react-router";
import PlaceholderBody from "@/core/components/PlaceholderBody";

export const Route = createFileRoute("/_manager/_analytics/descriptive")({
  component: RouteComponent,
  head: () => ({
    meta: [{ title: "Descriptive Analytics | Humay" }],
  }),
});

function RouteComponent() {
  return <PlaceholderBody />;
}
