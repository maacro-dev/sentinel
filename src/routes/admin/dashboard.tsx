import { createFileRoute } from "@tanstack/react-router";
import PlaceholderBody from "@/components/placeholder-body";
import { Home } from "lucide-react";
import { log } from "@/utils";

export const Route = createFileRoute("/admin/dashboard")({
  component: RouteComponent,
  head: () => ({
    meta: [{ title: "Admin Dashboard | Humay" }],
  }),
  staticData: {
    routeFor: "admin",
    label: "Dashboard",
    icon: Home,
    group: "Overview",
    navItemOrder: 1,
  },
});

function RouteComponent() {
  log("RENDER", "AdminDashboardRouteComponent");
  return <PlaceholderBody />;
}
