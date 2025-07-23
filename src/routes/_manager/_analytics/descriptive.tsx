import { createFileRoute } from "@tanstack/react-router";
import PlaceholderBody from "@/core/components/PlaceholderBody";
import { ChartArea } from "lucide-react";

export const Route = createFileRoute("/_manager/_analytics/descriptive")({
  component: RouteComponent,
  head: () => ({
    meta: [{ title: "Descriptive Analytics | Humay" }],
  }),
  staticData: {
    routeFor: "data_manager",
    label: "Descriptive",
    icon: ChartArea,
    group: "Analytics",
    navItemOrder: 1,
    disabled: true
  },
});

function RouteComponent() {
  return <PlaceholderBody />;
}
