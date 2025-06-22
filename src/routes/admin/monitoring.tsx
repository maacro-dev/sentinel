import PlaceholderBody from "@/components/placeholder-body";
import { createFileRoute } from "@tanstack/react-router";
import { Activity } from "lucide-react";

export const Route = createFileRoute("/admin/monitoring")({
  component: RouteComponent,
  staticData: {
    metadata: {
      group: "Core",
      title: "System Monitoring",
      icon: Activity,
      sidebarOptions: {
        showInSidebar: true,
        order: 4,
      },
      for: "admin",
    },
  },
});

function RouteComponent() {
  return <PlaceholderBody />;
}
