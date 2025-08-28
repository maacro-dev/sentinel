import { KVList, KVItem } from '@/core/components/KeyValue'
import { PageContainer } from '@/core/components/layout'
import { createCrumbLoader } from '@/core/utils/breadcrumb'
import { Sanitizer } from '@/core/utils/sanitizer'
import { formKeyMappings } from '@/features/forms/mappings'
import { createFileRoute } from '@tanstack/react-router'
import { FormRouteType } from './-config'
import { formDataByMfidOptions } from '@/features/forms/queries/options'
import { Separator } from '@/core/components/ui/separator'
import { useFormEntry } from '@/features/forms/hooks/useFormData'
import { NavBackButton, NavNextButton, NavPreviousButton } from '@/core/components/NavigationButton'
import { FormDataEntry, FormDataGroup } from '@/features/forms/schemas/formData'
import { Skeleton } from '@/core/components/ui/skeleton'
import { Button } from '@/core/components/ui/button'
import { Textarea } from '@/core/components/ui/textarea'
import { Camera, Combine, Grid2x2, SquareCheckBig, User } from 'lucide-react'
import { useFormDetailNavigator } from '@/features/forms/hooks/useEntryNavigator'

export const Route = createFileRoute('/_manager/forms/$formType/$mfid')({
  component: RouteComponent,
  loader: ({ params, context: { queryClient } }) => {
    queryClient.ensureQueryData(
      formDataByMfidOptions({
        formType: params.formType as FormRouteType,
        mfid: params.mfid,
      })
    )
    return { breadcrumb: createCrumbLoader({ label: params.mfid }) }
  }
})


function RouteComponent() {
  const { formType, mfid } = Route.useParams()
  const { data, isLoading } = useFormEntry({ formType: formType as FormRouteType, mfid })

  const {
    hasNext,
    hasPrev,
    goNext,
    goPrev,
    loading: navLoading,
  } = useFormDetailNavigator(formType as FormRouteType, mfid);

  if (isLoading || navLoading) {
    return <PageContainer>Loading...</PageContainer>
  }

  return (
    <PageContainer className="gap-4">
      <div role="navigation-buttons" className='px-6 flex justify-between'>
        <NavBackButton label='Back' />
        <div className='flex items-center gap-6'>
          <NavPreviousButton label="Previous" onClick={goPrev} disabled={!hasPrev} />
          <NavNextButton label='Next' onClick={goNext} disabled={!hasNext} />
        </div>
      </div>
      <div className='flex flex-col gap-4'>
        <GeneralSection data={data} />
        <FormDataSection data={data.activity.formData} title={'Activity Data'} />
        <ImagesSection />
        <VerificationSection />
      </div>
      <Separator className="my-8" />
      <div className='flex-col gap-6 h-full rounded-xl flex items-center justify-center p-4'>
        <h1 className="text-3xl font-medium tracking-widest">(つ•̀ꞈ•̀)つ</h1>
        <span className="text-muted-foreground/60 text-xs">To be implemented soon...</span>
      </div>
    </PageContainer>
  )
}



function DataGroup({ data, title, icon }: { data: FormDataGroup, title: string, icon: React.ReactNode }) {
  return (
    <div className='flex-1 flex flex-col gap-4 border rounded-container p-6'>
      <div className="flex gap-2.5 items-center">
        {icon}
        <h1 className="text-base">{title}</h1>
      </div>
      <KVList className='gap-2.5'>
        {Object.entries(data).map(([key, value]) => (
          <KVItem
            variant='side'
            key={key}
            pair={{
              key: Sanitizer.key(key, formKeyMappings),
              value: Sanitizer.value(value)
            }}
          />
        ))}
      </KVList>
    </div>
  )
}


function GeneralSection({ data }: { data: FormDataEntry }) {
  return (
    <section className='flex flex-row gap-4'>
      <DataGroup icon={<User className="size-4" />} data={data.collection} title="Farmer & Collection" />
      <DataGroup icon={<Grid2x2 className="size-4" />} data={data.field} title="Field & Location" />
      <DataGroup icon={<Grid2x2 className="size-4" />} data={data.season} title="Season & Status" />
    </section>
  )
}

function FormDataSection({ data, title }: { data: FormData, title: string }) {
  return (
    <section className='p-6 flex flex-col gap-4 border rounded-container '>
      <div className="flex gap-2.5 items-center">
        <Combine className="size-4" />
        <h1 className="text-base">{title}</h1>
      </div>
      <KVList className='gap-2.5' itemsPerColumn={5} containerClassName='gap-8'>
        {Object.entries(data).map(([key, value]) => (
          <KVItem
            variant='side'
            key={key}
            pair={{
              key: Sanitizer.key(key, formKeyMappings),
              value: Sanitizer.value(value)
            }}
          />
        ))}
      </KVList>
    </section>
  )
}

function ImagesSection({ images }: { images?: string[] | null }) {
  console.log(images)
  return (
    <section className='p-6 flex flex-col gap-4 border rounded-container '>
      <div className="flex gap-2.5 items-center">
        <Camera className="size-4" />
        <h1 className="text-base">Field Images</h1>
      </div>
      <div className='flex flex-row gap-4'>
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className='flex-1 aspect-square' />
        ))}
      </div>
    </section>
  )
}


function VerificationSection() {
  return (
    <section className='p-6 flex flex-col gap-6 border rounded-container '>
      <div className="flex gap-2.5 items-center">
        <SquareCheckBig className="size-4" />
        <h1 className="text-base">Verification</h1>
      </div>
      <div className="space-y-2">
        <p className='text-sm text-muted-foreground'>Remarks (Optional)</p>
        <Textarea className='resize-none min-h-40' placeholder='Add any comments or observations...' />
      </div>
      <div className='flex gap-8'>
        <Button className='flex-1'>Approve</Button>
        <Button variant="outline" className='flex-1'>Reject</Button>
      </div>
    </section>
  )
}
