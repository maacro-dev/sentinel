import { createFileRoute } from "@tanstack/react-router";
import PlaceholderBody from "@/core/components/PlaceholderBody";
import { PackagePlus } from "lucide-react";

export const Route = createFileRoute("/_manager/forms/production/")({
  component: RouteComponent,
  head: () => ({
    meta: [{ title: "Production | Humay" }],
  }),
  staticData: {
    role: "data_manager",
    label: "Production",
    sidebar: {
      order: 4,
      icon: PackagePlus,
      disabled: true,
    }
  },
});

function RouteComponent() {
  return <PlaceholderBody />;
}
