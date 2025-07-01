import PlaceholderBody from "@/components/placeholder-body";
import { createFileRoute } from "@tanstack/react-router";
import { IdCard } from "lucide-react";

export const Route = createFileRoute("/_manager/mfid_management")({
  component: RouteComponent,
  head: () => ({
    meta: [{ title: "MFID Management | Humay" }],
  }),
  staticData: {
    routeFor: "data_manager",
    label: "MFID Management",
    icon: IdCard,
    group: "Overview",
    navItemOrder: 3,
  },
});

function RouteComponent() {
  return <PlaceholderBody />;
}
