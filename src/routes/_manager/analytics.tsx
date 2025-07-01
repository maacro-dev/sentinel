import { createFileRoute } from "@tanstack/react-router";
import PlaceholderBody from "@/components/placeholder-body";
import { ChartArea } from "lucide-react";

export const Route = createFileRoute("/_manager/analytics")({
  component: RouteComponent,
  head: () => ({
    meta: [{ title: "Analytics | Humay" }],
  }),
  staticData: {
    routeFor: "data_manager",
    label: "Analytics",
    icon: ChartArea,
    group: "Overview",
    navItemOrder: 2,
  },
});

function RouteComponent() {
  return <PlaceholderBody />;
}
