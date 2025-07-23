import { createFileRoute } from "@tanstack/react-router";
import PlaceholderBody from "@/core/components/PlaceholderBody";
import { Cuboid } from "lucide-react";

export const Route = createFileRoute("/_manager/_forms/nutrientManagement")({
  component: RouteComponent,
  head: () => ({
    meta: [{ title: "Nutrient Management | Humay" }],
  }),
  staticData: {
    routeFor: "data_manager",
    label: "Nutrient Management",
    icon: Cuboid,
    group: "Forms",
    navItemOrder: 6,
    disabled: true
  },
});

function RouteComponent() {
  return <PlaceholderBody />;
}
