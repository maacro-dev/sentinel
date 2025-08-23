import { PageContainer } from '@/core/components/layout';
import { createFileRoute } from '@tanstack/react-router'
import { FormRouteType } from './-config';
import { formDataOptions } from '@/features/forms/queries/options';
import { FormDataTable } from '@/features/forms/components/FormDataTable';
import { FormDetailSheet } from '@/features/forms/components/FormDetailSheet';
import { FormDataEntry } from '@/features/forms/schemas/formData';
import { useSheetData } from '@/core/hooks/useSheetData';
import { useCallback } from 'react';
import { useFormEntry } from '@/features/forms/hooks/useFormData';
import { defaultPaginationSearchSchema } from '@/core/components/TablePagination';
import { mfidSchema } from '@/features/forms/schemas/searchParams';

export const Route = createFileRoute('/_manager/forms/$formType/')({
  component: RouteComponent,
  validateSearch: defaultPaginationSearchSchema.extend({ mfid: mfidSchema }),
  loader: ({ params, context: { queryClient } }) => {
    queryClient.ensureQueryData(formDataOptions({ formType: params.formType }));
  }
})

function RouteComponent() {
  const navigate = Route.useNavigate()
  const { formType } = Route.useParams();
  const { mfid } = Route.useSearch()

  const { data } = useFormEntry({
    formType: formType as FormRouteType,
    mfid: mfid!,
    enabled: !!mfid
  });

  const sheet = useSheetData<FormDataEntry>({
    key: mfid,
    data: data ?? null,
    onClose: () => navigate({ search: (prev) => ({ ...prev, mfid: undefined }) })
  })

  const handleOnRowClick = useCallback((row: { mfid: string }) => {
    navigate({ to: ".", search: (prev) => ({ ...prev, mfid: row.mfid }) })
  }, [navigate])

  return (
    <PageContainer>
      <FormDataTable formType={formType as FormRouteType} onRowClick={handleOnRowClick} />
      <FormDetailSheet
        data={sheet.data}
        open={sheet.open}
        onOpenChange={sheet.onOpenChange}
      />
    </PageContainer>
  )
}
