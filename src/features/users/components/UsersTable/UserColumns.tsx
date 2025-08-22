import { ColumnDef } from "@tanstack/react-table";
import { User } from "../../schemas";
import { LastActiveCell } from "./cells/LastActive";
import { RoleCell } from "./cells/Role";
import { ViewActionCell } from "@/core/components/cells/ViewActionCell";

export const userTableColumns: ColumnDef<User, any>[] = [
  {
    id: 'name',
    accessorFn: (row) => row.first_name + ' ' + row.last_name,
    header: "Name",
    meta: { size: 'sm' }
  },
  { accessorKey: 'email', header: 'Email', meta: { size: 'xs' } },
  {
    accessorKey: 'role',
    header: 'Role',
    cell: (info) => <RoleCell role={info.getValue()} />,
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
    cell: () => <ViewActionCell />,
    meta: { size: '2xs', textAlign: "center" }
  },
]
