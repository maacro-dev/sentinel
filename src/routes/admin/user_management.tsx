import { createFileRoute } from "@tanstack/react-router";
import { Users } from "lucide-react";
import { usersQueryOptions } from "@/features/users/queries/options";
import { INCLUDE_ADMIN } from "@/features/users/config";
import { UsersTable } from "@/features/users/components/UsersTable";
import { Motion } from "@/core/components/Motion";

export const Route = createFileRoute("/admin/user_management")({
  component: RouteComponent,
  head: () => ({
    meta: [{ title: "User Management | Humay" }],
  }),
  loader: ({ context: { queryClient } }) => {
    queryClient.ensureQueryData(usersQueryOptions({ includeAdmin: INCLUDE_ADMIN }))
  },
  staticData: {
    routeFor: "admin",
    label: "User Management",
    icon: Users,
    group: "Access Control",
    navItemOrder: 1,
  },
});

function RouteComponent() {
  return (
    <Motion>
      <UsersTable includeAdmin={false} />
    </Motion>
  )
}
