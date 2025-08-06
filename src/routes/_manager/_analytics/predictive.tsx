import PlaceholderBody from '@/core/components/PlaceholderBody';
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_manager/_analytics/predictive')({
  component: RouteComponent,
  head: () => ({
    meta: [{ title: "Predictive Analytics | Humay" }],
  }),
})

function RouteComponent() {
  return <PlaceholderBody />;
}
