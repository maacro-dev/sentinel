import PlaceholderBody from "@/components/placeholder-body";
import { createFileRoute } from "@tanstack/react-router";
import { IdCard } from "lucide-react";

export const Route = createFileRoute("/_manager/mfid_management")({
  component: RouteComponent,
  head: () => ({
    meta: [{ title: "MFID Management | Humay" }],
  }),
  staticData: {
    metadata: {
      group: "Core",
      title: "MFID Management",
      icon: IdCard,
      sidebarOptions: {
        showInSidebar: true,
        order: 3,
      },
      for: "data_manager",
    },
  },
});

function RouteComponent() {
  return <PlaceholderBody />;
}
