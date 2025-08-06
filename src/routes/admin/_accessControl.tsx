import { createCrumbLoader } from '@/core/utils/breadcrumb'
import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/_accessControl')({
  component: Outlet,
  loader: () => ({ breadcrumb: createCrumbLoader({ label: 'Access Control', navigatable: false }) }),
})
