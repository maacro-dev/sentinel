import { createFileRoute } from "@tanstack/react-router";
import PlaceholderBody from "@/core/components/PlaceholderBody";
import { Leaf } from "lucide-react";

export const Route = createFileRoute("/_manager/forms/riceNonRice/")({
  component: RouteComponent,
  head: () => ({
    meta: [{ title: "Rice-non-Rice | Humay" }],
  }),
  staticData: {
    role: "data_manager",
    label: "Rice-non-Rice",
    sidebar: {
      order: 7,
      icon: Leaf,
      disabled: true
    }
  },
});

function RouteComponent() {
  return <PlaceholderBody />;
}
