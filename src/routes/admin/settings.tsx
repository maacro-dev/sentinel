import PlaceholderBody from "@/components/placeholder-body";
import { createFileRoute } from "@tanstack/react-router";
import { Settings } from "lucide-react";

export const Route = createFileRoute("/admin/settings")({
  component: RouteComponent,
  staticData: {
    metadata: {
      group: "Core",
      title: "Settings",
      icon: Settings,
      sidebarOptions: {
        showInSidebar: true,
        order: 6,
      },
      for: "admin",
    },
  },
});

function RouteComponent() {
  return <PlaceholderBody />;
}
