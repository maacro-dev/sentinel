import { KVItem, KVList } from '@/core/components/KeyValue'
import { PageContainer } from '@/core/components/layout'
import { NavigateBack } from '@/core/components/NavigateBack'
import { createCrumbLoader } from '@/core/utils/breadcrumb'
import { Sanitizer } from '@/core/utils/sanitizer'
import { useFieldData } from '@/features/forms/hooks/useFieldData'
import { formKeyMappings } from '@/features/forms/mappings'
import { fieldDataEntryOptions } from '@/features/forms/queries/options'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_manager/forms/fieldData/$mfid')({
  component: RouteComponent,
  loader: ({ params, context: { queryClient } }) => {
    queryClient.ensureQueryData(fieldDataEntryOptions({ mfid: params.mfid }))
    return { breadcrumb: createCrumbLoader({ label: params.mfid }) }
  },
  head: ({ params }) => ({ meta: [{ title: `Field Data | ${params.mfid} | Humay` }] }),
})


function RouteComponent() {
  const { mfid } = Route.useParams()
  const { data } = useFieldData({ mfid: mfid })

  return (
    <PageContainer>
      <div className='px-6'>
        <NavigateBack label='Back to Field Data' />
      </div>
      <div className="p-6 flex flex-col gap-4 ">
        <KVList itemsPerColumn={6}>
          {Object.entries(data).map(([key, value]) => (
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
    </PageContainer>
  )
}
