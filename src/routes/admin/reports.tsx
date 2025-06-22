import PlaceholderBody from "@/components/placeholder-body";
import { createFileRoute } from "@tanstack/react-router";
import { FileText } from "lucide-react";

export const Route = createFileRoute("/admin/reports")({
  component: RouteComponent,
  head: () => ({
    meta: [{ title: "Reports | Humay" }],
  }),
  staticData: {
    metadata: {
      group: "Operations",
      title: "Reports",
      icon: FileText,
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
