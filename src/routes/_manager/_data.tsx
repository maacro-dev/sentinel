import { createCrumbLoader } from '@/core/utils/breadcrumb'
import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/_manager/_data')({
  component: Outlet,
  loader: () => ({ breadcrumb: createCrumbLoader({ label: 'Data', navigatable: false }) }),
})
