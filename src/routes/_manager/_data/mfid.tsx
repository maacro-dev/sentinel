import { createCrumbLoader } from '@/core/utils/breadcrumb'
import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/_manager/_data/mfid')({
  loader: () => { return { breadcrumb: createCrumbLoader({ label: "MFID" }) } },
  component: Outlet,
})

