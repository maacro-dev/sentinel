import PlaceholderBody from "@/components/placeholder-body";
import { createFileRoute } from "@tanstack/react-router";
import { Server } from "lucide-react";

export const Route = createFileRoute("/admin/maintenance")({
  component: RouteComponent,
  head: () => ({
    meta: [{ title: "System Maintenance | Humay" }],
  }),
  staticData: {
    metadata: {
      group: "Core",
      title: "System Maintenance",
      icon: Server,
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
