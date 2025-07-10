import { CreateUserDialog } from "@/components/users/user-create-dialog";
import { UserCreate } from "@/lib/types/user";
import { createFileRoute } from "@tanstack/react-router";
import { Users } from "lucide-react";
import { logLoad, logRender } from "chronicle-log";
import { createUserMutation } from "@/mutations";
import { SearchBar } from "@/components/search-bar";
import { UsersTableSkeleton, UsersTableSuspense } from "@/components/users/users-table";
import { Suspense } from "react";
import { usersQueryOptions } from "@/queries";

export const Route = createFileRoute("/admin/user_management")({
  component: RouteComponent,
  head: () => ({
    meta: [{ title: "User Management | Humay" }],
  }),
  loader: ({ context: { queryClient } }) => {
    logLoad("User Management Data");
    queryClient.ensureQueryData(usersQueryOptions({ includeAdmin: false }));
    return null
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
  logRender("Admin User Management Route");

  const { mutateAsync: createUser, isPending } = createUserMutation()

  const onSubmit = async (fields: UserCreate) => {
    createUser(fields)
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="w-full flex justify-between">
        <div className="flex flex-col gap-1.5">
          <h1 className="scroll-m-20 text-4xl font-bold tracking-tight text-balance">
            User Management
          </h1>
          <p className="text-muted-foreground text-sm">
            Manage data collectors and data managers.
          </p>
        </div>
      </div>
      <div className="flex flex-col gap-4 ">
        <div className="space-y-4">
          {/* <h2 className="scroll-m-20 text-2xl font-semibold tracking-tight">
            Users
          </h2> */}
          <div className="flex justify-between">
            <SearchBar />
            <CreateUserDialog onSubmit={onSubmit} disabled={isPending} />
          </div>
          <Suspense fallback={<UsersTableSkeleton />}>
            <UsersTableSuspense />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
