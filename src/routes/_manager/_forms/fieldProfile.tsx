import { createFileRoute } from "@tanstack/react-router";
import { User } from "lucide-react";
import PlaceholderBody from "@/components/placeholder-body";

export const Route = createFileRoute("/_manager/_forms/fieldProfile")({
  component: RouteComponent,
  head: () => ({
    meta: [
      {
        title: "Field Profile | Humay"
      }
    ]
  }),
  staticData: {
    metadata: {
      group: "Forms",
      title: "Field Profile",
      icon: User,
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
