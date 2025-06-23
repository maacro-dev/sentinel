import { Button } from "@/components/ui/button";
import { User } from "@/lib/schemas/user";
import { mapRole } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { ColumnDef } from "@tanstack/react-table";
import { Edit, Eye, MoreHorizontal, Trash } from "lucide-react";

export const columns: ColumnDef<User>[] = [
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
    cell: ({ row }) => {
      const status = row.original.status;
      return (
        <span
          className={`px-2 py-1 text-xs font-medium rounded-full ${
            status === "active"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {status}
        </span>
      );
    },
  },
  {
    accessorKey: "last_active",
    header: "Last Active",
    cell: ({ row }) => {
      const lastActive = row.original.last_active;
      return (
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
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const user = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem
              className="text-xs"
              onClick={() => {
                console.log(user);
              }}
            >
              <Eye className="size-3" />
              View User Detail
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-xs"
              onClick={() => {
                console.log(user);
              }}
            >
              <Edit className="size-3" />
              Edit User
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-xs"
              onClick={() => {
                console.log(user);
              }}
            >
              <Trash className="size-3" />
              Delete User
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
