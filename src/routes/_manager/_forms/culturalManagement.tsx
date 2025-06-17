import { createFileRoute } from "@tanstack/react-router";
import PlaceholderBody from "@/components/placeholder-body";
import { Folder } from "lucide-react";

export const Route = createFileRoute("/_manager/_forms/culturalManagement")({
  component: RouteComponent,
  staticData: {
    metadata: {
      group: "Forms",
      title: "Cultural Management",
      icon: Folder,
      sidebarOptions: {
        showInSidebar: true,
        order: 3
      },
      for: "data_manager"
    }
  }
});

function RouteComponent() {
  return <PlaceholderBody />;
}
