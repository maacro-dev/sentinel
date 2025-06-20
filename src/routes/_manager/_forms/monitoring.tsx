import { createFileRoute } from "@tanstack/react-router";
import PlaceholderBody from "@/components/placeholder-body";
import { Activity } from "lucide-react";

export const Route = createFileRoute("/_manager/_forms/monitoring")({
  component: RouteComponent,
  head: () => ({
    meta: [
      {
        title: "Monitoring | Humay"
      }
    ]
  }),
  staticData: {
    metadata: {
      group: "Forms",
      title: "Monitoring",
      icon: Activity,
      sidebarOptions: {
        showInSidebar: true,
        order: 4
      },
      for: "data_manager"
    }
  }
});

function RouteComponent() {
  return <PlaceholderBody />;
}
