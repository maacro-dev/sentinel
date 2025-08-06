import { createFileRoute, Outlet } from "@tanstack/react-router";
import { createCrumbLoader } from "@/core/utils/breadcrumb";

export const Route = createFileRoute("/_manager/forms/riceNonRice")({
  component: Outlet,
  loader: () => ({ breadcrumb: createCrumbLoader({ label: "Rice and Non-Rice" }) }),
});
