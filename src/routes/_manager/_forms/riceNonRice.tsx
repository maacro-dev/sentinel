import { createFileRoute } from "@tanstack/react-router";
import PlaceholderBody from "@/components/placeholder-body";
import { Leaf } from "lucide-react";

export const Route = createFileRoute("/_manager/_forms/riceNonRice")({
  component: RouteComponent,
  head: () => ({
    meta: [{ title: "Rice-non-Rice | Humay" }],
  }),
  staticData: {
    routeFor: "data_manager",
    label: "Rice-non-Rice",
    icon: Leaf,
    group: "Forms",
    navItemOrder: 7,
  },
});

function RouteComponent() {
  return <PlaceholderBody />;
}
