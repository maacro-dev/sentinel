import { createFileRoute } from "@tanstack/react-router";
import PlaceholderBody from "@/core/components/PlaceholderBody";
import { Activity } from "lucide-react";

export const Route = createFileRoute("/_manager/forms/monitoring/")({
  component: RouteComponent,
  head: () => ({
    meta: [{ title: "Monitoring | Humay" }],
  }),
  staticData: {
    role: "data_manager",
    label: "Monitoring",
    sidebar: {
      order: 5,
      icon: Activity,
      disabled: true
    },
  }
});

function RouteComponent() {
  return <PlaceholderBody />;
}
