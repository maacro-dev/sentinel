import { createFileRoute } from "@tanstack/react-router";
import PlaceholderBody from "@/components/placeholder-body";
import { ShieldHalf } from "lucide-react";

export const Route = createFileRoute("/_manager/_forms/damageAssessment")({
  component: RouteComponent,
  head: () => ({
    meta: [{ title: "Damage Assessment | Humay" }],
  }),
  staticData: {
    metadata: {
      group: "Forms",
      title: "Damage Assessment",
      icon: ShieldHalf,
      sidebarOptions: {
        showInSidebar: true,
        order: 8,
      },
      for: "data_manager",
    },
  },
});

function RouteComponent() {
  return <PlaceholderBody />;
}
