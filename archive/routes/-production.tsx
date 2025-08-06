import { createFileRoute, Outlet } from "@tanstack/react-router";
import { createCrumbLoader } from "@/core/utils/breadcrumb";

export const Route = createFileRoute("/_manager/forms/production")({
  component: Outlet,
  loader: () => ({ breadcrumb: createCrumbLoader({ label: "Production" }) }),
});
