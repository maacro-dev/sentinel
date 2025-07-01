import { createFileRoute } from "@tanstack/react-router";
import PlaceholderBody from "@/components/placeholder-body";
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
  },
});

function RouteComponent() {
  return <PlaceholderBody />;
}
