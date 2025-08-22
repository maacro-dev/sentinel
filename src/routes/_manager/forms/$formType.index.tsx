import { PageContainer } from '@/core/components/layout';
import { createFileRoute } from '@tanstack/react-router'
import { FormRouteType } from './-config';
import { formDataOptions } from '@/features/forms/queries/options';
import { FormDataTable } from '@/features/forms/components/FormDataTable';
import { useCallback, useState } from 'react';
import { FormDetailSheet } from '@/features/forms/components/FormDetailSheet';
import { useFormDetail } from '@/features/forms/hooks/useFormData';
import { FormDataEntry } from '@/features/forms/schemas/formData';

export const Route = createFileRoute('/_manager/forms/$formType/')({
  component: RouteComponent,
  loader: ({ params, context: { queryClient } }) => {
    queryClient.ensureQueryData(formDataOptions({ formType: params.formType }));
  }
})

function RouteComponent() {
  const { formType } = Route.useParams();
  const [detailOpen, setDetailOpen] = useState<boolean>(false)
  const [selectedMfid, setSelectedMfid] = useState<string | null>(null);

  const { data } = useFormDetail(
    formType as FormRouteType,
    selectedMfid!,
    { enabled: !!selectedMfid }
  );

  const handleOpenChange = useCallback((open: boolean) => {
    setDetailOpen(open)
    if (!open) {
      setSelectedMfid(null)
    }
  }, [])

  return (
    <PageContainer>
      <FormDataTable
        formType={formType as FormRouteType}
        onRowClick={(row) => {
          setDetailOpen(true)
          setSelectedMfid(row.mfid)
        }}
      />
      {selectedMfid && (
        <FormDetailSheet
          data={data as FormDataEntry}
          open={detailOpen}
          onOpenChange={handleOpenChange}
        />
      )}
    </PageContainer>
  )
}
