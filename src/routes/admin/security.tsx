import PlaceholderBody from "@/core/components/PlaceholderBody";
import { createFileRoute } from "@tanstack/react-router";
import { Shield } from "lucide-react";

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
    disabled: true
  },
});

function RouteComponent() {
  return <PlaceholderBody />;
}
