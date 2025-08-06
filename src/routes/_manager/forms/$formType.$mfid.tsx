import { KVList, KVItem } from '@/core/components/KeyValue'
import { PageContainer } from '@/core/components/layout'
import { NavigateBack } from '@/core/components/NavigateBack'
import { createCrumbLoader } from '@/core/utils/breadcrumb'
import { flatten } from '@/core/utils/object'
import { Sanitizer } from '@/core/utils/sanitizer'
import { useFormData } from '@/features/forms/hooks/useFormData'
import { formKeyMappings } from '@/features/forms/mappings'
import { createFileRoute } from '@tanstack/react-router'
import { FormRouteType } from './-config'
import { formDataByMfidOptions } from '@/features/forms/queries/options'
import { Separator } from '@/core/components/ui/separator'

export const Route = createFileRoute('/_manager/forms/$formType/$mfid')({
  component: RouteComponent,
  loader: ({ params, context: { queryClient } }) => {
    queryClient.ensureQueryData(formDataByMfidOptions({ formType: params.formType as FormRouteType, mfid: params.mfid }))
    return { breadcrumb: createCrumbLoader({ label: params.mfid }) }
  }
})
function RouteComponent() {
  const { formType, mfid } = Route.useParams()
  const { data, isLoading } = useFormData(formType as FormRouteType, mfid)

  if (isLoading) {
    return <PageContainer>Loading...</PageContainer>
  }

  return (
    <PageContainer className="gap-0">
      <div className='px-6'>
        <NavigateBack label='Back' />
      </div>
      <div className="p-6 flex flex-col gap-4 ">
        <KVList itemsPerColumn={6}>
          {flatten(data, "form_data").map(([key, value]) => (
            <KVItem
              key={key}
              pair={{
                key: Sanitizer.key(key, formKeyMappings),
                value: Sanitizer.value(value)
              }}
            />
          ))}
        </KVList>
      </div>
      <Separator className="my-8"/>
      <div className='flex-col gap-6 h-full rounded-xl flex items-center justify-center p-4'>
          <h1 className="text-3xl font-medium tracking-widest">(つ•̀ꞈ•̀)つ</h1>
          <span className="text-muted-foreground/60 text-xs">To be implemented soon...</span>
      </div>
    </PageContainer>
  )
}
