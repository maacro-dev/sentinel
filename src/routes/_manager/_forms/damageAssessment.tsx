import { createFileRoute } from "@tanstack/react-router";
import PlaceholderBody from "@/core/components/PlaceholderBody";
import { ShieldHalf } from "lucide-react";

export const Route = createFileRoute("/_manager/_forms/damageAssessment")({
  component: RouteComponent,
  head: () => ({
    meta: [{ title: "Damage Assessment | Humay" }],
  }),
  staticData: {
    routeFor: "data_manager",
    label: "Damage Assessment",
    icon: ShieldHalf,
    group: "Forms",
    navItemOrder: 8,
    disabled: true
  },
});

function RouteComponent() {
  return <PlaceholderBody />;
}
