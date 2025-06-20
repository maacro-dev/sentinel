import { createFileRoute } from "@tanstack/react-router";
import PlaceholderBody from "@/components/placeholder-body";
import { PackagePlus } from "lucide-react";

export const Route = createFileRoute("/_manager/_forms/production")({
  component: RouteComponent,
  head: () => ({
    meta: [
      {
        title: "Production | Humay"
      }
    ]
  }),
  staticData: {
    metadata: {
      group: "Forms",
      title: "Production",
      icon: PackagePlus,
      sidebarOptions: {
        showInSidebar: true,
        order: 8
      },
      for: "data_manager"
    }
  }
});

function RouteComponent() {
  return <PlaceholderBody />;
}
