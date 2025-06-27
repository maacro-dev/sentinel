import { ColumnDef } from "@tanstack/react-table";
import { useMemo } from "react";
import { LastActiveCell, StatusCell } from "@/components/cell";
import { UserActionsCell } from "@/components/cell/user-actions-cell";
import { UserSummary } from "@/lib/types";
import { mapRole } from "@/lib/utils";

export const useUserColumns = (): ColumnDef<UserSummary>[] => {
  return useMemo(
    () => [
      {
        id: "full_name",
        header: "Full Name",
        accessorFn: ({ full_name }) => full_name,
        meta: {
          style: {
            textAlign: "right",
          },
        },
      },
      {
        accessorKey: "role",
        header: "Role",
        accessorFn: ({ role }) => mapRole(role),
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
