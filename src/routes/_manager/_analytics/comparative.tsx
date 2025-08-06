import PlaceholderBody from '@/core/components/PlaceholderBody';
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute("/_manager/_analytics/comparative")({
  component: RouteComponent,
  head: () => ({
    meta: [{ title: "Comparative Analytics | Humay" }],
  }),
});

function RouteComponent() {
  return <PlaceholderBody />;
}
