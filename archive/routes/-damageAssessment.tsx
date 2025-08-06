import { createFileRoute } from "@tanstack/react-router";
import PlaceholderBody from "@/core/components/PlaceholderBody";
import { ShieldHalf } from "lucide-react";

export const Route = createFileRoute("/_manager/forms/damageAssessment")({
  component: RouteComponent,
  head: () => ({
    meta: [{ title: "Damage Assessment | Humay" }],
  }),
  staticData: {
    role: "data_manager",
    label: "Damage Assessment",
    sidebar: {
      order: 6,
      icon: ShieldHalf,
      disabled: true
   },
  }
});

function RouteComponent() {
  return <PlaceholderBody />;
}
