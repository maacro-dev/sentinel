import { PageContainer } from '@/core/components/layout'
import { createCrumbLoader } from '@/core/utils/breadcrumb'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_manager/sandbox')({
  loader: () => {
    return { breadcrumb: createCrumbLoader({ label: "Sandbox" }) }
  },
  head: () => ({ meta: [{ title: "Sandbox | Humay" }] }),
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <PageContainer className='flex flex-col justify-center items-center'>
      <h1 className='text-muted-foreground'>UI Testing for <span className='tracking-wide font-semibold text-primary'>Sentinel</span></h1>
      <div className=''>
      </div>
    </PageContainer>
  )

}
