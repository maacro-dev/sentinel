import { createUser } from "@/api/users";
import { showErrorToast, showSuccessToast } from "@/app/toast";
import { Input } from "@/components/ui/input";
import { AddUserForm } from "@/components/users/user-create-dialog";
import { UserCreate } from "@/lib/types/user";
import { usersQueryOptions } from "@/queries";
import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { Search as SearchIcon, Users } from "lucide-react";
import { logLoad, logRender } from "chronicle-log";
import { TableHeader, TableRow, TableHead, TableBody, TableCell, Table } from "@/components/ui/table";
import { UserActionsCell } from "@/components/users/user-table/cells/user-actions-cell";
import { LastActiveCell, StatusCell } from "@/components/users/user-table/cells";
import { ROLE_LABELS } from "@/app/config";

export const Route = createFileRoute("/admin/user_management")({
  component: RouteComponent,
  head: () => ({
    meta: [{ title: "User Management | Humay" }],
  }),
  loader: ({ context: { queryClient } }) => {
    logLoad("User Management Data");
    queryClient.ensureQueryData(usersQueryOptions({ includeAdmin: false }));
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

  const { data: users } = useSuspenseQuery(usersQueryOptions({ includeAdmin: false }))
  const queryClient = useQueryClient()

  const onSubmit = async (fields: UserCreate) => {
    const result = await createUser(fields)
    if (!result.ok) {
      showErrorToast("Error", result.error?.message)
    } else {
      await queryClient.invalidateQueries(usersQueryOptions({ includeAdmin: false }))
      showSuccessToast("Success", "User created successfully")
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="w-full flex justify-between">
        <div>
          <h1 className="text-4xl font-semibold">User Management</h1>
          <p className="text-muted-foreground">
            Manage data collectors and data managers
          </p>
        </div>
        <AddUserForm onSubmit={onSubmit} />
      </div>
      <div className="flex flex-col gap-4">
      <div>
        <div className="w-72 flex items-center gap-2">
          <SearchIcon className="text-muted-foreground" />
          <Input placeholder="Search" />
        </div>
      </div>
        <h2 className="text-2xl font-semibold">Data Collectors</h2>
        <Table className="flex-1 w-full h-full">
          <TableHeader>
              <TableRow>
                <TableHead className="">Name</TableHead>
                <TableHead className="">Email</TableHead>
                <TableHead className="">Role</TableHead>
                <TableHead className="">Status</TableHead>
                <TableHead className="">Last Sign In</TableHead>
                <TableHead className="">Actions</TableHead>
              </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow 
                key={user.id} 
                className={`hover:bg-muted/50 ${user.role === "data_manager" && "bg-muted"}`}
                >
                <TableCell>{user.first_name} {user.last_name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{ROLE_LABELS[user.role]}</TableCell>
                <TableCell><StatusCell status={user.status} /></TableCell>
                <TableCell><LastActiveCell lastActive={user.last_sign_in_at} /></TableCell>
                <TableCell><UserActionsCell user={user} /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
