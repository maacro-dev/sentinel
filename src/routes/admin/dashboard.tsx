import { createFileRoute } from "@tanstack/react-router";
import { Home } from "lucide-react";

export const Route = createFileRoute("/admin/dashboard")({
  component: RouteComponent,
  head: () => ({
    meta: [{ title: "Admin Dashboard | Humay" }],
  }),
  loader: async () => {
  },
  staticData: {
    routeFor: "admin",
    label: "Dashboard",
    icon: Home,
    group: "Overview",
    navItemOrder: 1,
  },
});

function RouteComponent() {

  return (
    <div>
      <p className="text-muted-foreground border rounded-lg p-4 max-w-1/3">
        {}
      </p>
    </div>
  );
}
