import PlaceholderBody from "@/core/components/PlaceholderBody";
import { createFileRoute } from "@tanstack/react-router";
import { Server } from "lucide-react";

export const Route = createFileRoute("/admin/maintenance")({
  component: RouteComponent,
  head: () => ({
    meta: [{ title: "System Maintenance | Humay" }],
  }),
  staticData: {
    routeFor: "admin",
    label: "System Maintenance",
    icon: Server,
    group: "Operations",
    navItemOrder: 1,
    disabled: true
  },
});

function RouteComponent() {
  return <PlaceholderBody />;
}
