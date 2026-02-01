import { PageContainer } from '@/core/components/layout'
import { createCrumbLoader } from '@/core/utils/breadcrumb'
import { DataImportPrompt } from '@/features/import/components/DataImportPrompt'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_manager/_data/import')({
  loader: () => { return { breadcrumb: createCrumbLoader({ label: "Import" }) } },
  head: () => ({
    meta: [{ title: "Import | Humay" }],
  }),
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <PageContainer>
      <div className='h-full flex flex-col justify-center items-center '>
        <DataImportPrompt />
      </div>
    </PageContainer>
  )
}

