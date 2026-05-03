import { KVItem } from '@/core/components/KeyValue'
import { PageContainer } from '@/core/components/layout'
import { NavBackButton } from '@/core/components/NavigationButton'
import { createCrumbLoader } from '@/core/utils/breadcrumb'
import { Sanitizer } from '@/core/utils/sanitizer'
import { useMfid } from '@/features/mfid/hooks/useMfids'
import { MfidDetail, MfidStatus } from '@/features/mfid/schemas/mfid-table.schema'
import { createFileRoute } from '@tanstack/react-router'
import { MfidCollectionTasks } from '@/features/collection/components/MfidCollectionTasks'
import { MfidOtherSeasonsDialog } from '@/features/mfid/components/MfidOtherSeasonsDialog'

export const Route = createFileRoute('/_manager/_data/mfid/$mfid')({
  loader: ({ params }) => {
    return { breadcrumb: createCrumbLoader({ label: params.mfid }) }
  },
  head: () => ({ meta: [{ title: "MFID | Humay" }] }),
  component: RouteComponent,
})

function RouteComponent() {

  const { mfid } = Route.useParams()
  const { seasonId } = Route.useSearch()
  const effectiveSeasonId = seasonId === "all" ? null : (seasonId ?? undefined);
  const isAllSeasons = seasonId === "all";

  const { data: raw, isLoading } = useMfid({ mfid: mfid })


  if (!raw || isLoading) {
    return <PageContainer>Loading...</PageContainer>
  }
  const { status, ...data } = raw

  return (
    <PageContainer>
      <NavBackButton label='Back' />
      <div className='flex flex-col gap-2'>
        <MfidCard
          data={data}
          status={status}
          mfid={mfid}
          showOtherSeasons={!isAllSeasons}
        />
        <MfidCollectionTasks mfid={mfid} seasonId={effectiveSeasonId} />
      </div>
    </PageContainer>
  );
}

interface MfidCardProps {
  data: MfidDetail,
  status: MfidStatus,
  mfid: string,
  showOtherSeasons: boolean;
}

function MfidCard({ data, status, mfid, showOtherSeasons }: MfidCardProps) {
  const isAssigned = status === "assigned";

  return (
    <div className="flex flex-col gap-4 max-h-80 w-full border border-input p-6 rounded-container">
      <MfidCardHeader status={status} mfid={mfid} showOtherSeasons={showOtherSeasons} />
      <div className='flex flex-col gap-4'>
        <div className='flex flex-row gap-16 flex-wrap'>
          <KVItem pair={{ key: "Barangay", value: data.barangay ?? "N/A" }} />
          <KVItem pair={{ key: "City / Municipality", value: data.city_municipality ?? "N/A" }} />
          <KVItem pair={{ key: "Province", value: data.province ?? "N/A" }} />
          <KVItem pair={{ key: "Created At", value: Sanitizer.value(data.created_at) }} />
          <KVItem pair={{ key: "Assigned At", value: Sanitizer.value(data.used_at) }} />
        </div>
        {isAssigned && (
          <>
            <div className="border-t my-2" />
            <div className='flex flex-row gap-16 flex-wrap'>
              <KVItem pair={{ key: "Farmer Name", value: data.farmer_name ?? "N/A" }} />
              <KVItem pair={{ key: "Gender", value: Sanitizer.key(data.farmer_gender) ?? "N/A" }} />
              <KVItem pair={{ key: "Date of Birth", value: data.farmer_date_of_birth ? new Date(data.farmer_date_of_birth).toLocaleDateString() : "N/A" }} />
              <KVItem pair={{ key: "Cellphone No.", value: data.farmer_cellphone_no ?? "N/A" }} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function MfidCardHeader({ mfid, status, showOtherSeasons }: Omit<MfidCardProps, "data">) {
  return (
    <div className='w-full flex justify-between'>
      <div className="flex items-start gap-4">
        <span className="text-4xl font-semibold">{mfid}</span>
        <MfidStatusBadge status={status} />
      </div>

      {showOtherSeasons && <MfidOtherSeasonsDialog mfid={mfid} />}
    </div>
  )
}

function MfidStatusBadge({ status }: { status: MfidStatus }) {
  return (
    <span className="inline-flex items-center justify-center rounded-md border text-muted-foreground px-2.5 py-1 text-4xs font-medium w-fit" >
      {status === "assigned" ? "Assigned" : "Available"}
    </span>
  )
}


