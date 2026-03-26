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
import { useRef, useState } from 'react'
import html2canvas from "html2canvas-pro"

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
  const cardRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    if (!cardRef.current) return

    setIsDownloading(true)
    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: '#ffffff',
        scale: 1,
        useCORS: true,
      })

      const link = document.createElement('a')
      link.download = `mfid-${mfid}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()

    } catch (error) {
      console.error('Error generating image:', error)
      alert('Failed to download the card.')
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <div
      ref={cardRef}
      className="flex flex-col gap-6 max-h-80 w-full max-w-140 shadow-sm border border-input p-6 rounded-container"
    >
      <MfidCardHeader
        status={status}
        mfid={mfid}
        onDownload={handleDownload}
        isDownloading={isDownloading}
      />
      <div className='flex'>
        <div className='flex-1 flex flex-col gap-6 size-full max-w-90 '>
          <MfidAddress data={data} />
          <div className='flex gap-8 w-full'>
            <KVItem className="flex-1" pair={{ key: "Farmer", value: data.farmer_name ?? "N/A" }} />
            <KVItem className="flex-1 " pair={{ key: "Coordinates", value: data.coordinates ?? "N/A" }} />
          </div>
          <MfidTimestamp data={data} />
        </div>
        <div className='flex-1 flex justify-center items-center'>
          <MfidQR mfid={mfid} />
        </div>
      </div>
    </div>
  )
}

function MfidCardHeader({
  status,
  mfid,
  onDownload,
  isDownloading,
}: Omit<MfidCardProps, "data"> & {
  onDownload: () => void;
  isDownloading: boolean;
}) {
  return (
    <div className='w-full flex justify-between'>
      <div className="flex items-start gap-4">
        <span className="text-4xl font-semibold">{mfid}</span>
        <MfidStatusBadge status={status} />
      </div>
      <Button
        variant="outline"
        onClick={onDownload}
        disabled={isDownloading}
      >
        <Download className={isDownloading ? "animate-pulse" : ""} />
        {isDownloading && <span className="ml-2 text-xs">...</span>}
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
    <div className='flex gap-8 w-full'>
      <KVItem className="" pair={{ key: "Barangay", value: data.barangay ?? "N/A" }} />
      <KVItem className="flex-1" pair={{ key: "City / Municipality", value: data.city_municipality ?? "N/A" }} />
      <KVItem className="" pair={{ key: "Province", value: data.province ?? "N/A" }} />
    </div>
  );
}

function MfidTimestamp({ data }: Pick<MfidCardProps, "data">) {
  return (
    <div className='flex gap-8 w-full'>
      <KVItem className="flex-1 " pair={{ key: "Created At", value: Sanitizer.value(data.created_at) }} />
      <KVItem className="flex-1" pair={{ key: "Assigned At", value: Sanitizer.value(data.used_at) }} />
    </div>
  );
}

