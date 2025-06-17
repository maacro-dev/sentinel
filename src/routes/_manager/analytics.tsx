import { createFileRoute } from "@tanstack/react-router";
import PlaceholderBody from "@/components/placeholder-body";
import { ChartArea } from "lucide-react";

export const Route = createFileRoute("/_manager/analytics")({
  component: RouteComponent,
  staticData: {
    metadata: {
      group: "Core",
      title: "Analytics",
      icon: ChartArea,
      sidebarOptions: {
        showInSidebar: true,
        order: 2
      },
      for: "data_manager"
    }
  }
});

function RouteComponent() {
  return <PlaceholderBody />;
}
