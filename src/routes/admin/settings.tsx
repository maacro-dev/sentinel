import PlaceholderBody from "@/components/placeholder-body";
import { createFileRoute } from "@tanstack/react-router";
import { Settings } from "lucide-react";
import { logRender } from "chronicle-log";

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
  logRender("Admin Settings Route");
  return <PlaceholderBody />;
}
