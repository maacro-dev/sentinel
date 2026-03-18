import { memo } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "../ui/dropdown-menu";
import { MoreHorizontal, Eye } from "lucide-react";
import { Button } from "../ui/button";

export interface ViewActionCellProps {
  label?: string;
  onView?: () => void;
}

export const ViewActionCell = memo(({ label = "More Details", onView }: ViewActionCellProps) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button variant="ghost" className="border border-input cursor-pointer size-6 rounded-sm p-0 shrink-0">
        <MoreHorizontal className="h-4 w-4" />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" className="w-24 font-jetbrains-mono">
      <DropdownMenuItem
        className="hover:cursor-pointer text-3xs text-muted-foreground flex justify-center items-center"
        onClick={onView}
      >
        <Eye className="size-3" />
        {label}
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
));
