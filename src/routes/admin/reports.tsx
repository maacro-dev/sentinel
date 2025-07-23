import PlaceholderBody from "@/core/components/PlaceholderBody";
import { createFileRoute } from "@tanstack/react-router";
import { FileText } from "lucide-react";

export const Route = createFileRoute("/admin/reports")({
  component: RouteComponent,
  head: () => ({
    meta: [{ title: "Reports | Humay" }],
  }),
  staticData: {
    routeFor: "admin",
    label: "Reports",
    icon: FileText,
    group: "Operations",
    navItemOrder: 2,
    disabled: true
  },
});

function RouteComponent() {
  return <PlaceholderBody />;
}
