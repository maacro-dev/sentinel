import { createFileRoute } from "@tanstack/react-router";
import { FileText } from "lucide-react";

export const Route = createFileRoute("/admin/reports")({
  component: RouteComponent,
  staticData: {
    metadata: {
      group: "Core",
      title: "Reports",
      icon: FileText,
      sidebarOptions: {
        showInSidebar: true,
        order: 5,
      },
      for: "admin",
    },
  },
});

function RouteComponent() {
  return <div>Hello "/admin/reports"!</div>;
}
