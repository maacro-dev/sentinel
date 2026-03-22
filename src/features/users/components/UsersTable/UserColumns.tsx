import { ColumnDef } from "@tanstack/react-table";
import { User } from "../../schemas";
import { LastActiveCell } from "./cells/LastActive";
import { RoleCell } from "./cells/Role";
import { UserViewActionCell } from "./UserViewActionCell";
import { Badge } from "@/core/components/ui/badge";

export const userTableColumns: ColumnDef<User, any>[] = [
  {
    accessorKey: 'first_name',
    header: "First Name",
    meta: { size: '2xs' }
  },
  {
    accessorKey: 'last_name',
    header: "Last Name",
    meta: { size: '2xs' }
  },
  { accessorKey: 'email', header: 'Email', meta: { size: 'md' } },
  {
    accessorKey: 'role',
    header: 'Role',
    cell: (info) => <RoleCell role={info.getValue()} />,
    meta: { size: 'xs' }
  },
  {
    accessorKey: 'is_active',
    header: 'Account Status',
    cell: (info) => {
      const isActive = info.getValue();
      return (
        <Badge variant={isActive ? 'success' : 'warning'} className="text-3xs py-1.5 px-2">
          {isActive ? 'Active' : 'Deactivated'}
        </Badge>
      );
    },
    meta: { size: 'xs' }
  },
  {
    accessorKey: 'last_sign_in_at',
    header: 'Last Sign In',
    cell: (info) => <LastActiveCell lastActive={info.getValue()} />,
    meta: { size: 'xs' }
  },
  {
    id: "actions",
    header: 'Actions',
    cell: ({ row }) => <UserViewActionCell user={row.original} />,
    meta: { size: '2xs', textAlign: "center" }
  },
]
