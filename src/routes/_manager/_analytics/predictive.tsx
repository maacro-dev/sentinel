import PlaceholderBody from '@/core/components/PlaceholderBody';
import { createFileRoute } from '@tanstack/react-router'
import { TrendingUpDown } from 'lucide-react';

export const Route = createFileRoute('/_manager/_analytics/predictive')({
  component: RouteComponent,
  head: () => ({
    meta: [{ title: "Predictive Analytics | Humay" }],
  }),
  staticData: {
    routeFor: "data_manager",
    label: "Predictive",
    icon: TrendingUpDown,
    group: "Analytics",
    navItemOrder: 3,
    disabled: true
  },
})

function RouteComponent() {
  return <PlaceholderBody />;
}
