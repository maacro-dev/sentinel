import { createFileRoute } from "@tanstack/react-router";
import PlaceholderBody from "@/components/placeholder-body";
import { Cuboid } from "lucide-react";

export const Route = createFileRoute("/_manager/_forms/nutrientManagement")({
  component: RouteComponent,
  head: () => ({
    meta: [
      {
        title: "Nutrient Management | Humay"
      }
    ]
  }),
  staticData: {
    metadata: {
      group: "Forms",
      title: "Nutrient Management",
      icon: Cuboid,
      sidebarOptions: {
        showInSidebar: true,
        order: 6
      },
      for: "data_manager"
    }
  }
});

function RouteComponent() {
  return <PlaceholderBody />;
}
