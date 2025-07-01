import { createFileRoute } from "@tanstack/react-router";
import { User } from "lucide-react";
import PlaceholderBody from "@/components/placeholder-body";

export const Route = createFileRoute("/_manager/_forms/fieldProfile")({
  component: RouteComponent,
  head: () => ({
    meta: [{ title: "Field Profile | Humay" }],
  }),
  staticData: {
    routeFor: "data_manager",
    label: "Field Profile",
    icon: User,
    group: "Forms",
    navItemOrder: 2,
  },
});

function RouteComponent() {
  return <PlaceholderBody />;
}
