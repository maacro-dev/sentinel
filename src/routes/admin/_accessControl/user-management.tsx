import { createFileRoute } from "@tanstack/react-router";
import { usersQueryOptions } from "@/features/users/queries/options";
import { INCLUDE_ADMIN } from "@/features/users/config";
import { UsersTable } from "@/features/users/components/UsersTable";
import { PageContainer } from "@/core/components/layout";
import { createCrumbLoader } from "@/core/utils/breadcrumb";
import { defaultPaginationSearchSchema } from "@/core/components/TablePagination";

export const Route = createFileRoute("/admin/_accessControl/user-management")({
  component: RouteComponent,
  validateSearch: defaultPaginationSearchSchema,
  loader: ({ context: { queryClient } }) => {
    queryClient.ensureQueryData(usersQueryOptions({ includeAdmin: INCLUDE_ADMIN }))
    return { breadcrumb: createCrumbLoader({ label: "User Management" }) }
  },
  head: () => ({
    meta: [{ title: "User Management | Humay" }],
  }),
});

function RouteComponent() {
  return (
    <PageContainer>
      <UsersTable includeAdmin={false} />
    </PageContainer>
  )
}
