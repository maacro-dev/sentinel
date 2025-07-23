import { createFileRoute } from "@tanstack/react-router";
import PlaceholderBody from "@/core/components/PlaceholderBody";
import { PackagePlus } from "lucide-react";

export const Route = createFileRoute("/_manager/_forms/production")({
  component: RouteComponent,
  head: () => ({
    meta: [{ title: "Production | Humay" }],
  }),
  staticData: {
    routeFor: "data_manager",
    label: "Production",
    icon: PackagePlus,
    group: "Forms",
    navItemOrder: 8,
    disabled: true
  },
});

function RouteComponent() {
  return <PlaceholderBody />;
}
