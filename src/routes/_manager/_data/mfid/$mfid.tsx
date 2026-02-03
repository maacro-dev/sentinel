import { KVItem } from '@/core/components/KeyValue'
import { PageContainer } from '@/core/components/layout'
import { NavBackButton } from '@/core/components/NavigationButton'
import { Button } from '@/core/components/ui/button'
import { createCrumbLoader } from '@/core/utils/breadcrumb'
import { Sanitizer } from '@/core/utils/sanitizer'
import { MfidQR } from '@/features/mfid/components/QRCode'
import { useMfid } from '@/features/mfid/hooks/useMfids'
import { MfidDetail, MfidStatus } from '@/features/mfid/schemas/mfid-table.schema'
import { createFileRoute } from '@tanstack/react-router'
import { Download } from 'lucide-react'

export const Route = createFileRoute('/_manager/_data/mfid/$mfid')({
  loader: ({ params }) => {
    return { breadcrumb: createCrumbLoader({ label: params.mfid }) }
  },
  head: () => ({ meta: [{ title: "MFID | Humay" }] }),
  component: RouteComponent,
})

function RouteComponent() {
  const { mfid } = Route.useParams()
  const { data: raw, isLoading } = useMfid({ mfid: mfid })

  if (!raw || isLoading) {
    return <PageContainer>Loading...</PageContainer>
  }

  const { status, ...data } = raw

  return (
    <PageContainer>
      <NavBackButton label='Back' />
      <div className='h-full flex flex-col justify-center items-center '>
        <MfidCard data={data} status={status} mfid={mfid} />
      </div>
    </PageContainer>
  );
}

interface MfidCardProps {
  data: MfidDetail,
  status: MfidStatus,
  mfid: string
}

function MfidCard({ data, status, mfid }: MfidCardProps) {
  return (
    <div className="flex flex-col gap-6 rounded-container border p-6 max-h-80 w-[55%]">
      <MfidCardHeader status={status} mfid={mfid} />
      <div className='flex'>
        <div className='flex-3 flex flex-col gap-6 size-full'>
          <KVItem pair={{ key: "Farmer", value: data.farmer_name ?? "N/A" }} />
          <MfidAddress data={data} />
          <MfidTimestamp data={data} />
        </div>
        <div className='flex-2 flex justify-center items-center'>
          <MfidQR mfid={mfid} />
        </div>
      </div>
    </div>
  )
}

function MfidCardHeader({ status, mfid }: Omit<MfidCardProps, "data">) {
  return (
    <div className='w-full flex justify-between'>
      <div className="flex items-start gap-4">
        <span className="text-4xl font-semibold">{mfid}</span>
        <MfidStatusBadge status={status} />
      </div>
      <Button variant="outline">
        <Download />
      </Button>
    </div>
  )
}

function MfidStatusBadge({ status }: { status: MfidStatus }) {
  return (
    <span className="inline-flex items-center justify-center rounded-md border text-muted-foreground px-2.5 py-1 text-4xs font-medium w-fit" >
      {status === "used" ? "Used" : "Available"}
    </span>
  )
}

function MfidAddress({ data }: Pick<MfidCardProps, "data">) {
  return (
    <div className='flex gap-8'>
      <KVItem pair={{ key: "Barangay", value: data.barangay ?? "N/A" }} />
      <KVItem pair={{ key: "City / Municipality", value: data.city_municipality ?? "N/A" }} />
      <KVItem pair={{ key: "Province", value: data.province ?? "N/A" }} />
    </div>
  );
}

function MfidTimestamp({ data }: Pick<MfidCardProps, "data">) {
  return (
    <div className='flex gap-8'>
      {/* Note: Use a dedicated date formatting utility instead of Sanitizer.value */}
      <KVItem pair={{ key: "Created At", value: Sanitizer.value(data.created_at) }} />
      <KVItem pair={{ key: "Assigned At", value: Sanitizer.value(data.used_at) }} />
    </div>
  );
}
