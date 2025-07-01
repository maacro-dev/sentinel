import PlaceholderBody from "@/components/placeholder-body";
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
  },
});

function RouteComponent() {
  return <PlaceholderBody />;
}
