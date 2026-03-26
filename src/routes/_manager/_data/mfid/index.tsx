import { PageContainer } from '@/core/components/layout'
import { defaultPaginationSearchSchema } from '@/core/components/TablePagination'

import { MfidTable } from '@/features/mfid/components/MfidTable/MfidTable'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useCallback } from 'react'
import { Info } from 'lucide-react'

export const Route = createFileRoute('/_manager/_data/mfid/')({
  head: () => ({ meta: [{ title: "MFID | Humay" }] }),
  validateSearch: defaultPaginationSearchSchema,
  component: RouteComponent,
})

function RouteComponent() {
  const navigate = useNavigate()
  const handleRowClick = useCallback((row: { mfid: string }) => {
    navigate({
      to: "/mfid/$mfid",
      params: { mfid: row.mfid }
    })
  }, [])

  return (
    <PageContainer>
      <div className="bg-muted/50 border rounded-container p-3 flex items-center gap-3 text-sm text-muted-foreground">
        <Info className="size-4 shrink-0" />
        <span>
          This view shows <strong>all MFIDs</strong> ever created, regardless of the season selected in the header.
          Use the status filter below to see available or used MFIDs.
        </span>
      </div>
      <MfidTable onRowClick={handleRowClick} />
    </PageContainer>
  )
}
