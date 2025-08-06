import { createCrumbLoader } from '@/core/utils/breadcrumb'
import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/_manager/_analytics')({
  component: Outlet,
  loader: () => ({ breadcrumb: createCrumbLoader({ label: 'Analytics', navigatable: false }) }),
})
