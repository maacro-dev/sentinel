import { MoreHorizontal, Eye, Edit, Trash } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { UserSummary } from "@/lib/types";

type UserActionsCellProps = {
  user: UserSummary;
};

export const UserActionsCell = ({ user }: UserActionsCellProps) => (
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
