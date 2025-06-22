import PlaceholderBody from "@/components/placeholder-body";
import { createFileRoute } from "@tanstack/react-router";
import { Shield } from "lucide-react";

export const Route = createFileRoute("/admin/security")({
  component: RouteComponent,
  head: () => ({
    meta: [{ title: "System Security | Humay" }],
  }),
  staticData: {
    metadata: {
      group: "Access Control",
      title: "System Security",
      icon: Shield,
      sidebarOptions: {
        showInSidebar: true,
        order: 2,
      },
      for: "admin",
    },
  },
});

function RouteComponent() {
  return <PlaceholderBody />;
}
