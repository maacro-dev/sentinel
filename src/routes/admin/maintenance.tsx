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
      group: "Operations",
      title: "System Maintenance",
      icon: Server,
      sidebarOptions: {
        showInSidebar: true,
        order: 1,
      },
      for: "admin",
    },
  },
});

function RouteComponent() {
  return <PlaceholderBody />;
}
