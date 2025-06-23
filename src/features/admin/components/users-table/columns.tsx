import { User } from "@/lib/schemas/user";
import { mapRole } from "@/lib/utils";
import { ColumnDef } from "@tanstack/react-table";
import { useMemo } from "react";
import { LastActiveCell, StatusCell } from "@/components/cell";
import { UserActionsCell } from "@/components/cell/user-actions-cell";

export const useUserColumns = (): ColumnDef<User>[] => {
  return useMemo(
    () => [
      {
        id: "full_name",
        header: "Full Name",
        accessorFn: (row) => `${row.first_name} ${row.last_name}`,
      },
      {
        accessorKey: "role",
        header: "Role",
        accessorFn: (row) => mapRole(row.role),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <StatusCell status={row.original.status} />,
      },
      {
        accessorKey: "last_active",
        header: "Last Active",
        cell: ({ row }) => <LastActiveCell lastActive={row.original.last_active} />,
      },
      {
        id: "actions",
        cell: ({ row }) => <UserActionsCell user={row.original} />,
      },
    ],
    []
  );
};
