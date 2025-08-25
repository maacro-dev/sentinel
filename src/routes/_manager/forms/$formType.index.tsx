import { PageContainer } from '@/core/components/layout';
import { createFileRoute, useRouter } from '@tanstack/react-router'
import { FormRouteType } from './-config';
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
  const { navigate, preloadRoute } = useRouter()

  const handleOnRowClick = useCallback((row: { field: { mfid: string } }) => {
    navigate({
      to: "/forms/$formType/$mfid",
      params: { formType: formType, mfid: row.field.mfid }
    })
  }, [navigate, formType])

  const handleOnRowIntent = useCallback((row: { field: { mfid: string } }) => {
    preloadRoute({
      to: "/forms/$formType/$mfid",
      params: { formType: formType, mfid: row.field.mfid }
    })
  }, [preloadRoute, formType])

  return (
    <PageContainer>
      <FormDataTable
        formType={formType as FormRouteType}
        onRowClick={handleOnRowClick}
        onRowIntent={handleOnRowIntent}
      />
    </PageContainer>
  )
}
