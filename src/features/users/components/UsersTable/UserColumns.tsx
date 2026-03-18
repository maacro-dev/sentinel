import { ColumnDef } from "@tanstack/react-table";
import { User } from "../../schemas";
import { LastActiveCell } from "./cells/LastActive";
import { RoleCell } from "./cells/Role";
import { UserViewActionCell } from "./UserViewActionCell";

export const userTableColumns: ColumnDef<User, any>[] = [
  {
    accessorKey: 'first_name',
    header: "First Name",
    meta: { size: '3xs' }
  },
  {
    accessorKey: 'last_name',
    header: "Last Name",
    meta: { size: '3xs' }
  },
  { accessorKey: 'email', header: 'Email', meta: { size: 'sm' } },
  {
    accessorKey: 'role',
    header: 'Role',
    cell: (info) => <RoleCell role={info.getValue()} />,
    meta: { size: '2xs' }
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
