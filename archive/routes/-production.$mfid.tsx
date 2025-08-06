import { createFileRoute } from "@tanstack/react-router";
import PlaceholderBody from "@/core/components/PlaceholderBody";
import { createCrumbLoader } from "@/core/utils/breadcrumb";

export const Route = createFileRoute("/_manager/forms/production/$mfid")({
  component: RouteComponent,
  loader: ({ params, context: { queryClient } }) => {
    return { breadcrumb: createCrumbLoader({ label: params.mfid }) };
  },
  head: ({ params }) => ({ meta: [{ title: `Production | ${params.mfid} | Humay` }] }),
});

function RouteComponent() {
  return <PlaceholderBody />;
}
