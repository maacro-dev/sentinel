import { createFileRoute } from "@tanstack/react-router";
import { LayoutDashboard } from "lucide-react";

export const Route = createFileRoute("/_manager/dashboard")({
  component: RouteComponent,
  head: () => ({
    meta: [{ title: "Dashboard | Humay" }],
  }),
  staticData: {
    routeFor: "data_manager",
    label: "Dashboard",
    icon: LayoutDashboard,
    group: "Overview",
    navItemOrder: 1,
  },
});

function RouteComponent() {
  return (
    <>
      <div className="grid auto-rows-min gap-4 md:grid-cols-3">
        <div className="bg-muted/50 aspect-video rounded-xl" />
        <div className="bg-muted/50 aspect-video rounded-xl" />
        <div className="bg-muted/50 aspect-video rounded-xl" />
      </div>
      <div className="bg-muted/50 min-h-full flex-1 rounded-xl md:min-h-min" />
    </>
  );
}
