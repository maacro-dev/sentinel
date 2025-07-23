import { createColumnHelper } from "@tanstack/react-table";
import { User } from "../../schemas";
import { UserActionsCell } from "./cells/UserActions";
import { LastActiveCell } from "./cells/LastActive";
import { RoleCell } from "./cells/Role";

const columnHelper = createColumnHelper<User>();

export const UserColumns = [
  columnHelper.accessor(
    (row) => row.first_name + ' ' + row.last_name,
    {
      id: "name",
      header: "Name",
      cell: (info) => <span>{info.getValue()}</span>,
    }
  ),

  columnHelper.accessor('email', {
    header: "Email",
    cell: (info) => <span>{info.getValue()}</span>,
  }),

  columnHelper.accessor('role', {
    header: "Role",
    cell: (info) => <RoleCell role={info.getValue()}/>,
  }),

  columnHelper.accessor('last_sign_in_at', {
    header: "Last Sign In",
    cell: (info) => <LastActiveCell lastActive={info.getValue()}/>,
  }),

  columnHelper.display({
    id: "actions",
    cell: (info) => <UserActionsCell user={info.row.original} />,
    size: 20
  })
]
