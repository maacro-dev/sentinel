import { PageContainer } from '@/core/components/layout';
import { FieldDataTable } from '@/features/forms/components/FieldDataTable';
import { fieldDataOptions } from '@/features/forms/queries/options';
import { createFileRoute } from '@tanstack/react-router'
import { Grid2X2 } from 'lucide-react';

export const Route = createFileRoute('/_manager/forms/fieldData/')({
  component: RouteComponent,
  head: () => ({ meta: [{ title: "Field Data | Humay" }] }),
  loader: ({ context: { queryClient }}) => {
    queryClient.ensureQueryData(fieldDataOptions())
  },
  staticData: {
    role: "data_manager",
    label: "Field Data",
    sidebar: {
      order: 1,
      icon: Grid2X2,
    }
  },
});

function RouteComponent() {
  return (
    <PageContainer>
      <FieldDataTable />
    </PageContainer>
  )
}
