import { PageContainer } from '@/core/components/layout';
import { createFileRoute } from '@tanstack/react-router'
import { FormRouteType } from './-config';
import { formDataOptions } from '@/features/forms/queries/options';
import { FormDataTable } from '@/features/forms/components/FormDataTable';

export const Route = createFileRoute('/_manager/forms/$formType/')({
  component: RouteComponent,
  loader: ({ params, context: { queryClient } }) => {
    queryClient.ensureQueryData(formDataOptions({ formType: params.formType }));
  }
})

function RouteComponent() {
  const { formType } = Route.useParams();

  return(
    <PageContainer>
      <FormDataTable formType={formType as FormRouteType} />
    </PageContainer>
  )
}
