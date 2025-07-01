import { createFileRoute } from "@tanstack/react-router";
import { FormInput } from "lucide-react";
import PlaceholderBody from "@/components/placeholder-body";

export const Route = createFileRoute("/_manager/_forms/overview")({
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
  },
});

function RouteComponent() {
  return <PlaceholderBody />;
}
