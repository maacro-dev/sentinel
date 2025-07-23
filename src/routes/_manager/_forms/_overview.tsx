import { createFileRoute } from "@tanstack/react-router";
import { FormInput } from "lucide-react";
import PlaceholderBody from "@/core/components/PlaceholderBody";

export const Route = createFileRoute("/_manager/_forms/_overview")({
  component: RouteComponent,
  head: () => ({
    meta: [{ title: "Overview | Humay" }],
  }),
  staticData: {
    routeFor: "data_manager",
    label: "Overview",
    icon: FormInput,
    group: "Forms",
    navItemOrder: 1,
    disabled: true
  },
});

function RouteComponent() {
  return <PlaceholderBody />;
}
