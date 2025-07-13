import { createFileRoute } from "@tanstack/react-router";
import { Grid2X2 } from "lucide-react";
import PlaceholderBody from "@/components/placeholder-body";

export const Route = createFileRoute("/_manager/_forms/fieldData")({
  component: RouteComponent,
  head: () => ({
    meta: [{ title: "Field Data | Humay" }],
  }),
  staticData: {
    routeFor: "data_manager",
    label: "Field Data",
    icon: Grid2X2,
    group: "Forms",
    navItemOrder: 2,
  },
});

function RouteComponent() {
  return <PlaceholderBody />;
}
