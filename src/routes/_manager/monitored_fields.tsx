import { createFileRoute } from "@tanstack/react-router";
import { IdCard, } from "lucide-react";
import { fieldsQueryOptions } from "@/features/fields/queries/options";
import { FieldsTable } from "@/features/fields/components/FieldsTable/FieldsTable";
import { Motion } from "@/core/components/Motion";

export const Route = createFileRoute("/_manager/monitored_fields")({
  component: RouteComponent,
  loader: ({ context: { queryClient } }) => queryClient.ensureQueryData(fieldsQueryOptions()),
  head: () => ({
    meta: [{ title: "Monitored Fields | Humay" }],
  }),
  staticData: {
    routeFor: "data_manager",
    label: "Fields",
    icon: IdCard,
    group: "Overview",
    navItemOrder: 3,
  },
});

function RouteComponent() {
  return (
    <Motion>
      <FieldsTable />
    </Motion>
  )
}
