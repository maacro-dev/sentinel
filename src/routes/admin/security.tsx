import PlaceholderBody from "@/components/placeholder-body";
import { createFileRoute } from "@tanstack/react-router";
import { Shield } from "lucide-react";
import { logRender } from "chronicle-log";

export const Route = createFileRoute("/admin/security")({
  component: RouteComponent,
  head: () => ({
    meta: [{ title: "System Security | Humay" }],
  }),
  staticData: {
    routeFor: "admin",
    label: "System Security",
    icon: Shield,
    group: "Access Control",
    navItemOrder: 2,
  },
});

function RouteComponent() {
  logRender("Admin Security Route");
  return <PlaceholderBody />;
}
