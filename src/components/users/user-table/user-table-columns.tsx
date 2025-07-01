import { ColumnDef } from "@tanstack/react-table";
import { useMemo } from "react";
import { LastActiveCell, StatusCell } from "@/components/users/user-table/cells";
import { UserActionsCell } from "@/components/users/user-table/cells/user-actions-cell";
import { User } from "@/lib/types";
import { ROLE_LABELS } from "@/app/config";

export const useUserColumns = (): ColumnDef<User>[] => {
  return useMemo(
    () => [
      {
        id: "full_name",
        header: "Full Name",
        accessorFn: ({ first_name, last_name }) => `${first_name} ${last_name}`,
        meta: {
          style: {
            textAlign: "right",
          },
        },
      },
      {
        accessorKey: "role",
        header: "Role",
        accessorFn: ({ role }) => ROLE_LABELS[role],
        meta: {
          style: {
            textAlign: "right",
          },
        },
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => <StatusCell status={row.original.status} />,
        meta: {
          style: {
            textAlign: "right",
          },
        },
      },
      {
        accessorKey: "last_active",
        header: "Last Active",
        cell: ({ row }) => <LastActiveCell lastActive={row.original.last_sign_in_at} />,
        meta: {
          style: {
            textAlign: "right",
          },
        },
      },
      {
        id: "actions",
        cell: ({ row }) => <UserActionsCell user={row.original} />,
        size: 80,
        meta: {
          style: {
            textAlign: "right",
          },
        },
      },
    ],
    []
  );
};
