import { createCrumbLoader } from '@/core/utils/breadcrumb'
import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/_manager/forms')({
  component: Outlet,
  loader: () => ({ breadcrumb: createCrumbLoader({ label: "Forms", navigatable: false }) }),
})
