import PlaceholderBody from "@/components/placeholder-body";
import { createFileRoute } from "@tanstack/react-router";
import { LayoutDashboard } from "lucide-react";

export const Route = createFileRoute("/_manager/dashboard")({
  component: RouteComponent,
  head: () => ({
    meta: [
      {
        title: "Dashboard | Humay"
      }
    ]
  }),
  staticData: {
    metadata: {
      group: "Core",
      title: "Dashboard",
      icon: LayoutDashboard,
      sidebarOptions: {
        showInSidebar: true,
        order: 1
      },
      for: "data_manager"
    }
  }
});

function RouteComponent() {
  return <PlaceholderBody />;
}
