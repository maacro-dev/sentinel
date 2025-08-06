import { memo } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/core/components/ui/dropdown-menu";
import { Button } from "@/core/components/ui/button";
import { MoreHorizontal, Eye } from "lucide-react";

interface FormActionCellProps {
  label?: string;
}

export const FormActionCell = memo(({ label = "More Details"}: FormActionCellProps) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button variant="ghost" className="border border-input cursor-pointer size-6 rounded-sm p-0">
        <span className="sr-only">Open menu</span>
        <MoreHorizontal className="h-4 w-4" />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" className="font-jetbrains-mono">
      <DropdownMenuItem
        className="hover:cursor-pointer text-[0.7rem] text-muted-foreground flex justify-center items-center"
        onClick={() => {}}
      >
        <Eye className="size-3" />
        {label}
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
));
