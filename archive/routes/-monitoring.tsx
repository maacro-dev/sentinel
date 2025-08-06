import { createFileRoute, Outlet } from "@tanstack/react-router";
import { createCrumbLoader } from "@/core/utils/breadcrumb";

export const Route = createFileRoute("/_manager/forms/monitoring")({
  component: Outlet,
  loader: () => ({ breadcrumb: createCrumbLoader({ label: "Monitoring Visit" }) }),
});
