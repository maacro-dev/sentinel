import { createFileRoute } from "@tanstack/react-router";
import PlaceholderBody from "@/core/components/PlaceholderBody";
import { Activity } from "lucide-react";

export const Route = createFileRoute("/_manager/_forms/monitoring")({
  component: RouteComponent,
  head: () => ({
    meta: [{ title: "Monitoring | Humay" }],
  }),
  staticData: {
    routeFor: "data_manager",
    label: "Monitoring",
    icon: Activity,
    group: "Forms",
    navItemOrder: 4,
    disabled: true
  },
});

function RouteComponent() {
  return <PlaceholderBody />;
}
