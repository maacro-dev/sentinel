import { mapRole } from "@/lib/utils";
import { ColumnDef } from "@tanstack/react-table";
import { useMemo } from "react";
import { LastActiveCell, StatusCell } from "@/components/cell";
import { UserActionsCell } from "@/components/cell/user-actions-cell";

import type { User } from "@/lib/types";

export const useUserColumns = (): ColumnDef<User>[] => {
  return useMemo(
    () => [
      {
        id: "full_name",
        header: "Full Name",
        accessorFn: (row) => `${row.first_name} ${row.last_name}`,
        meta: {
          style: {
            textAlign: "right",
          },
        },
      },
      {
        accessorKey: "role",
        header: "Role",
        accessorFn: (row) => mapRole(row.role),
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
        cell: ({ row }) => <LastActiveCell lastActive={row.original.last_active} />,
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
