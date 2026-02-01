import { createFileRoute } from "@tanstack/react-router";
import { fieldsQueryOptions } from "@/features/fields/queries/options";
import { FieldsTable } from "@/features/fields/components/FieldsTable/FieldsTable";
import { PageContainer } from "@/core/components/layout";
import { createCrumbLoader } from "@/core/utils/breadcrumb";
import { defaultPaginationSearchSchema } from "@/core/components/TablePagination";

export const Route = createFileRoute("/_manager/_overview/monitored-fields")({
  component: RouteComponent,
  loader: ({ context: { queryClient } }) => {
    queryClient.ensureQueryData(fieldsQueryOptions());
    return { breadcrumb: createCrumbLoader({ label: "Fields" }) };
  },
  validateSearch: defaultPaginationSearchSchema,
  head: () => ({
    meta: [{ title: "Fields | Humay" }],
  }),
});

function RouteComponent() {
  return (
    <PageContainer>
      <FieldsTable />
    </PageContainer>
  )
}
