import { Button } from "@/components/ui/button";
import { User } from "@/lib/schemas/user";
import { mapRole } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { ColumnDef } from "@tanstack/react-table";
import { Edit, Eye, MoreHorizontal, Trash } from "lucide-react";
import { useMemo } from "react";

const StatusCell = ({ status }: { status: string }) => (
  <span
    className={`text-center px-3 py-1 text-xs  rounded-sm ${
      status === "active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
    }`}
  >
    {status}
  </span>
);

const LastActiveCell = ({ lastActive }: { lastActive: string | null }) => (
  <span className="text-xs text-muted-foreground">
    {lastActive
      ? new Date(lastActive).toLocaleString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        })
      : "Never"}
  </span>
);

const ActionsCell = ({ user }: { user: User }) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button variant="ghost" className="h-4 w-4 p-0">
        <span className="sr-only">Open menu</span>
        <MoreHorizontal className="h-4 w-4" />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end">
      <DropdownMenuItem className="text-xs" onClick={() => console.log(user)}>
        <Eye className="size-3 mr-2" />
        View User Detail
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem className="text-xs" onClick={() => console.log(user)}>
        <Edit className="size-3 mr-2" />
        Edit User
      </DropdownMenuItem>
      <DropdownMenuItem className="text-xs" onClick={() => console.log(user)}>
        <Trash className="size-3 mr-2" />
        Delete User
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
);

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
        cell: ({ row }) => <ActionsCell user={row.original} />,
      },
    ],
    []
  );
};
