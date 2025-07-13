import PlaceholderBody from '@/components/placeholder-body';
import { createFileRoute } from '@tanstack/react-router'
import { GitCompare } from 'lucide-react';

export const Route = createFileRoute("/_manager/_analytics/comparative")({
  component: RouteComponent,
  head: () => ({
    meta: [{ title: "Comparative Analytics | Humay" }],
  }),
  staticData: {
    routeFor: "data_manager",
    label: "Comparative",
    icon: GitCompare,
    group: "Analytics",
    navItemOrder: 2,
  },
});

function RouteComponent() {
  return <PlaceholderBody />;
}

