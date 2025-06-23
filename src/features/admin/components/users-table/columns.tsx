import { User } from "@/lib/schemas/user";
import { mapRole } from "@/lib/utils";
import { ColumnDef } from "@tanstack/react-table";

export const columns: ColumnDef<User>[] = [
  {
    id: "full_name",
    header: "Full Name",
    accessorFn: (row) => `${row.first_name} ${row.last_name}`,
  },
  {
    accessorKey: "username",
    header: "Username",
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
];
