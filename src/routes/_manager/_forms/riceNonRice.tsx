import { createFileRoute } from "@tanstack/react-router";
import PlaceholderBody from "@/components/placeholder-body";
import { Leaf } from "lucide-react";

export const Route = createFileRoute("/_manager/_forms/riceNonRice")({
  component: RouteComponent,
  head: () => ({
    meta: [{ title: "Rice-non-Rice | Humay" }],
  }),
  staticData: {
    metadata: {
      group: "Forms",
      title: "Rice-non-Rice",
      icon: Leaf,
      sidebarOptions: {
        showInSidebar: true,
        order: 7,
      },
      for: "data_manager",
    },
  },
});

function RouteComponent() {
  return <PlaceholderBody />;
}
