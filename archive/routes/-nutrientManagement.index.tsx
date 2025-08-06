import { createFileRoute } from "@tanstack/react-router";
import PlaceholderBody from "@/core/components/PlaceholderBody";
import { Cuboid } from "lucide-react";

export const Route = createFileRoute("/_manager/forms/nutrientManagement/")({
  component: RouteComponent,
  head: () => ({
    meta: [{ title: "Nutrient Management | Humay" }],
  }),
  staticData: {
    role: "data_manager",
    label: "Nutrient Management",
    sidebar: {
      order: 3,
      icon: Cuboid,
      disabled: true
    },
  },
});

function RouteComponent() {
  return <PlaceholderBody />;
}
