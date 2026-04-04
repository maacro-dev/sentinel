import { KVList, KVItem } from '@/core/components/KeyValue'
import { PageContainer } from '@/core/components/layout'
import { createCrumbLoader } from '@/core/utils/breadcrumb'
import { Sanitizer } from '@/core/utils/sanitizer'
import { formKeyMappings } from '@/features/forms/mappings'
import { createFileRoute } from '@tanstack/react-router'
import { FormType } from './-config'
import { formDataByIdOptions } from '@/features/forms/queries/options'
import { useFormEntry } from '@/features/forms/hooks/useFormData'
import { NavBackButton, NavNextButton, NavPreviousButton } from '@/core/components/NavigationButton'
import { FormDataEntry, FormDataGroup } from '@/features/forms/schemas/formData'
import { Button } from '@/core/components/ui/button'
import { Textarea } from '@/core/components/ui/textarea'
import { Camera, Combine, Grid2x2, SquareCheckBig, User } from 'lucide-react'
import { useFormDetailNavigator } from '@/features/forms/hooks/useEntryNavigator'
import { Label } from '@/core/components/ui/label'
import { useState } from 'react'
import { useVerification } from '@/features/forms/hooks/useVerification'
import { FertilizerApplicationsList } from '@/features/forms/components/FertilizerApplicationList'

export const Route = createFileRoute('/_manager/forms/$formType/$id')({
  component: RouteComponent,
  params: { parse: (params) => ({ id: Number(params.id) }) },
  loaderDeps: ({ search: { seasonId } }) => ({ seasonId }),
  loader: ({ params, context: { queryClient }, deps: { seasonId } }) => {
    queryClient.ensureQueryData(
      formDataByIdOptions({
        formType: params.formType as FormType,
        id: params.id,
        seasonId: seasonId
      })
    )
    // should change to mfid
    return { breadcrumb: createCrumbLoader({ label: String(params.id) }) }
  }
})


function RouteComponent() {
  const { formType, id } = Route.useParams()
  const { seasonId } = Route.useSearch()

  const { data, isLoading } = useFormEntry({ formType: formType as FormType, id, seasonId: seasonId })

  const { hasNext, hasPrev, goNext, goPrev, loading: navLoading, } = useFormDetailNavigator(formType as FormType, String(id), seasonId);

  const verifyMutation = useVerification(formType, id, seasonId);

  const handleVerify = (params: { status: 'approved' | 'rejected'; remarks?: string }) => {
    verifyMutation.mutate({
      id: data.activity.id,
      status: params.status,
      remarks: params.remarks,
    });
  };

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
      <div
        className={`w-full py-2 rounded-container px-3 border text-xs font-medium
          ${data.activity.verificationStatus === "approved" ? "bg-green-100 border-green-600 text-green-600" : ""}
          ${data.activity.verificationStatus === "rejected" ? "bg-red-100 border-red-600 text-red-600" : ""}
          ${data.activity.verificationStatus === "pending" ? "bg-amber-100 border-amber-600 text-amber-600" : ""}
          `
        }
      >
        This entry is {data.activity.verificationStatus}.
      </div>
      <div className='flex flex-col gap-4'>
        <GeneralSection data={data} />
        <FormDataSection data={data.activity.formData} title={'Form Data'} />
        {data.activity.verificationStatus !== "unknown" && (
          <>
            <ImagesSection images={data.activity.imageUrls} />
            <VerificationSection
              data={data}
              onVerify={handleVerify}
              isVerifying={verifyMutation.isPending}
            />
          </>
        )}
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
  const collection = {
    ...data.collection,
    collectedBy: data.collection.collectedBy
      ? `${data.collection.collectedBy.first_name} ${data.collection.collectedBy.last_name}`
      : 'N/A',
    verifiedBy: data.collection.verifiedBy
      ? `${data.collection.verifiedBy.first_name} ${data.collection.verifiedBy.last_name}`
      : null,
  } ;


  return (
    <section className='flex flex-row gap-4'>
      {/* @ts-ignore */}
      <DataGroup icon={<User className="size-4" />} data={collection} title="Farmer & Collection" />
      <DataGroup icon={<Grid2x2 className="size-4" />} data={data.field} title="Field & Location" />
      <DataGroup icon={<Grid2x2 className="size-4" />} data={data.season} title="Season & Status" />
    </section>
  );
}

function FormDataSection({ data, title }: { data: FormData, title: string }) {

  // @ts-ignore
  const { applications, monitoring_visit, ...otherData } = data;

  return (
    <section className='p-6 flex flex-col gap-4 border rounded-container'>
      <div className="flex gap-2.5 items-center">
        <Combine className="size-4" />
        <h1 className="text-base">{title}</h1>
      </div>
      <div>
        <KVList className='gap-2.5' itemsPerColumn={5} containerClassName='gap-8'>
          {Object.entries(otherData).map(([key, value]) => (
            <KVItem key={key} pair={{ key: Sanitizer.key(key, formKeyMappings), value: Sanitizer.value(value) }} />
          ))}
        </KVList>
        {monitoring_visit && (
          <div className="mt-4 pt-4 border-t">
            <div className="flex gap-2.5 mb-4 items-center">
              <Combine className="size-4" />
              <h1 className="text-base">Monitoring Visit</h1>
            </div>
            <KVList className='gap-2.5'>
              {Object.entries(monitoring_visit).map(([key, value]) => (
                <KVItem key={key} pair={{ key: Sanitizer.key(key, formKeyMappings), value: Sanitizer.value(value) }} />
              ))}
            </KVList>
          </div>
        )}
        {applications && <FertilizerApplicationsList applications={applications} />}
      </div>
    </section>
  );
}


function ImagesSection({ images }: { images?: string[] | null }) {
  if (!images || images.length === 0) {
    return (
      <section className='p-4 flex flex-col gap-2 border rounded-container'>
        <div className="flex gap-2 items-center">
          <Camera className="size-4" />
          <h1 className="text-sm font-medium">Field Images</h1>
        </div>
        <p className="text-xs text-muted-foreground">No images available</p>
      </section>
    );
  }

  const labels = ["Front View", "Right View", "Left View", "Back View", "Close up",];

  const slots = Array.from({ length: 5 }, (_, index) => ({
    url: index < images.length ? images[index] : null,
    label: labels[index],
  }));

  return (
    <section className='p-4 flex flex-col gap-4 border rounded-container'>
      <div className="flex gap-2 items-center">
        <Camera className="size-4" />
        <h1 className="text-sm font-medium">Field Images</h1>
      </div>

      <div className='grid grid-cols-5 gap-4'>
        {slots.map(({ url, label }, index) => (
          <div key={index} className='flex flex-col gap-4 items-center'>
            {url ? (
              <img
                src={url}
                alt={label}
                className="w-full aspect-square object-cover rounded-sm"
                crossOrigin="anonymous"
              />
            ) : (
              <div className="w-full aspect-square rounded bg-muted flex items-center justify-center text-muted-foreground text-xs">
                No image
              </div>
            )}
            <Label className='text-muted-foreground text-xs'>{label}</Label>
          </div>
        ))}
      </div>
    </section>
  );
}


interface VerificationSectionProps {
  data: FormDataEntry;
  onVerify: (params: { status: 'approved' | 'rejected'; remarks?: string }) => void;
  isVerifying: boolean;
}

function VerificationSection({ data, onVerify, isVerifying }: VerificationSectionProps) {
  const [remarks, setRemarks] = useState(data.activity.remarks || '');
  const isPending = data.activity.verificationStatus === 'pending';

  const handleVerify = (status: 'approved' | 'rejected') => {
    onVerify({ status, remarks: remarks.trim() || undefined });
  };

  return (
    <section className='p-6 flex flex-col gap-6 border rounded-container'>
      <div className="flex gap-2.5 items-center justify-between">
        <div className="flex gap-2.5 items-center">
          <SquareCheckBig className="size-4" />
          <h1 className="text-base">Verification</h1>
        </div>
      </div>

      <div className="space-y-2">
        <p className='text-sm text-muted-foreground'>Remarks</p>
        {isPending ? (
          <Textarea
            className='resize-none min-h-40'
            placeholder='Add any comments or observations...'
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            disabled={isVerifying}
          />
        ) : (
          <div className="p-4 bg-muted/10 rounded-md text-sm text-foreground whitespace-pre-wrap">
            {data.activity.remarks || <span className="text-muted-foreground italic">No remarks provided</span>}
          </div>
        )}
      </div>

      {isPending && (
        <div className='flex gap-8'>
          <Button
            className='flex-1'
            onClick={() => handleVerify('approved')}
            disabled={isVerifying}
          >
            {isVerifying ? 'Approving...' : 'Approve'}
          </Button>
          <Button
            variant="outline"
            className='flex-1'
            onClick={() => handleVerify('rejected')}
            disabled={isVerifying}
          >
            {isVerifying ? 'Rejecting...' : 'Reject'}
          </Button>
        </div>
      )}
    </section>
  );
}
