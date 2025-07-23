import { createFileRoute } from "@tanstack/react-router";
import PlaceholderBody from "@/core/components/PlaceholderBody";
import { Folder } from "lucide-react";

export const Route = createFileRoute("/_manager/_forms/culturalManagement")({
  component: RouteComponent,
  head: () => ({
    meta: [{ title: "Cultural Management | Humay" }],
  }),
  staticData: {
    routeFor: "data_manager",
    label: "Cultural Management",
    icon: Folder,
    group: "Forms",
    navItemOrder: 3,
    disabled: true
  },
});

function RouteComponent() {
  return <PlaceholderBody />;
}
