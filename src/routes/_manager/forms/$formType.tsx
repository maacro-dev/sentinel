import { createCrumbLoader } from '@/core/utils/breadcrumb'
import { Sanitizer } from '@/core/utils/sanitizer'
import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/_manager/forms/$formType')({
  component: Outlet,
  head: ({ params: { formType } }) => ({ meta: [{ title: `${Sanitizer.key(formType)} | Humay` }] }),
  loader: ({ params }) => ({
    breadcrumb: createCrumbLoader({ label: Sanitizer.key(params.formType) })
  }),
})
