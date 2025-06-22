import { createFileRoute } from "@tanstack/react-router";
import { FormInput } from "lucide-react";
import PlaceholderBody from "@/components/placeholder-body";

export const Route = createFileRoute("/_manager/_forms/overview")({
  component: RouteComponent,
  head: () => ({
    meta: [{ title: "Overview | Humay" }],
  }),
  staticData: {
    metadata: {
      group: "Forms",
      title: "Overview",
      icon: FormInput,
      sidebarOptions: {
        showInSidebar: true,
        order: 1,
      },
      for: "data_manager",
    },
  },
});

function RouteComponent() {
  return <PlaceholderBody />;
}
