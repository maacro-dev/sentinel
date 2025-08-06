import { createCrumbLoader } from '@/core/utils/breadcrumb'
import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/_overview')({
  component: Outlet,
  loader: () => ({ breadcrumb: createCrumbLoader({ label: 'Overview', navigatable: false }) }),
})
