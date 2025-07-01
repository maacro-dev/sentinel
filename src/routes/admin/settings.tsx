import PlaceholderBody from "@/components/placeholder-body";
import { createFileRoute } from "@tanstack/react-router";
import { Settings } from "lucide-react";

export const Route = createFileRoute("/admin/settings")({
  component: RouteComponent,
  head: () => ({
    meta: [{ title: "Settings | Humay" }],
  }),
  staticData: {
    routeFor: "admin",
    label: "Settings",
    icon: Settings,
    group: "Configuration",
    navItemOrder: 1,
  },
});

function RouteComponent() {
  return <PlaceholderBody />;
}
