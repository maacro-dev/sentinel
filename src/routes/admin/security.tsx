import PlaceholderBody from "@/components/placeholder-body";
import { createFileRoute } from "@tanstack/react-router";
import { Shield } from "lucide-react";

export const Route = createFileRoute("/admin/security")({
  component: RouteComponent,
  staticData: {
    metadata: {
      group: "Core",
      title: "System Security",
      icon: Shield,
      sidebarOptions: {
        showInSidebar: true,
        order: 3,
      },
      for: "admin",
    },
  },
});

function RouteComponent() {
  return <PlaceholderBody />;
}
