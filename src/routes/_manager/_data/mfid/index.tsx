import { PageContainer } from '@/core/components/layout'
import { defaultPaginationSearchSchema } from '@/core/components/TablePagination'
import { MfidTable } from '@/features/mfid/components/MfidTable/MfidTable'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useCallback } from 'react'

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
      <MfidTable onRowClick={handleRowClick} />
    </PageContainer>
  )
}
