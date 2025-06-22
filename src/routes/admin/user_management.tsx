import PlaceholderBody from "@/components/placeholder-body";
import { createFileRoute } from "@tanstack/react-router";
import { Users } from "lucide-react";

export const Route = createFileRoute("/admin/user_management")({
  component: RouteComponent,
  staticData: {
    metadata: {
      group: "Core",
      title: "User Management",
      icon: Users,
      sidebarOptions: {
        showInSidebar: true,
        order: 2,
      },
      for: "admin",
    },
  },
});

function RouteComponent() {
  return <PlaceholderBody />;
}
