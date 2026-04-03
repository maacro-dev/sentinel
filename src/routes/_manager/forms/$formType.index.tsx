import { PageContainer } from '@/core/components/layout';
import { createFileRoute, useRouter } from '@tanstack/react-router'
import { FormType } from './-config';
import { formDataOptions } from '@/features/forms/queries/options';
import { FormDataTable } from '@/features/forms/components/FormDataTable';
import { useCallback } from 'react';
import { defaultPaginationSearchSchema } from '@/core/components/TablePagination';

export const Route = createFileRoute('/_manager/forms/$formType/')({
  component: RouteComponent,
  validateSearch: defaultPaginationSearchSchema,
  loader: ({ params, context: { queryClient } }) => {
    queryClient.ensureQueryData(formDataOptions({ formType: params.formType }));
  }
})

function RouteComponent() {
  const { formType } = Route.useParams();
  const { seasonId } = Route.useSearch()
  const { navigate, preloadRoute } = useRouter()

  const handleOnRowClick = useCallback((row: { activity: { id: number } }) => {
    console.log("row clicked =", row.activity.id);
    navigate({
      to: "/forms/$formType/$id",
      params: { formType: formType as string, id: row.activity.id },
    });
  }, [navigate, formType]);

  const handleOnRowIntent = useCallback((row: { activity: { id: number } }) => {
    preloadRoute({
      to: "/forms/$formType/$id",
      params: { formType: formType as string, id: row.activity.id },
    });
  }, [preloadRoute, formType]);

  return (
    <PageContainer>
      <FormDataTable
        seasonId={seasonId}
        formType={formType as FormType}
        onRowClick={handleOnRowClick}
        onRowIntent={handleOnRowIntent}
      />
    </PageContainer>
  )
}
