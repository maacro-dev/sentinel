
import { TableCell, TableRow } from "@/core/components/ui/table";
import { format } from "date-fns";
import { Button } from "@/core/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/core/components/ui/tooltip";
import { CollectionTask } from "../../schemas/collection.schema";

interface TaskPreviousRowProps {
  task: CollectionTask;
  onViewForm: (task: CollectionTask) => void;
  isExpanded?: boolean;
}

export function TaskPreviousRow({ task, onViewForm }: TaskPreviousRowProps) {
  return (
    <TableRow className="bg-muted/10 last:border-b-0 group hover:bg-muted/20 transition-colors">
      <TableCell></TableCell>
      <TableCell></TableCell>
      <TableCell>
        <div className="flex items-center gap-2 pl-6 text-muted-foreground border-l-2 border-muted-foreground/20 ml-2">
          <span className="text-xs">↳</span>
          <span className="text-xs">Previous</span>
        </div>
      </TableCell>
      <TableCell className="text-xs text-muted-foreground">
        {task.collector_name ?? "Unassigned"}
      </TableCell>
      <TableCell className="text-xs text-muted-foreground">
        {format(new Date(task.start_date), "MMM d, yyyy")}
      </TableCell>
      <TableCell className="text-xs text-muted-foreground">
        {format(new Date(task.end_date), "MMM d, yyyy")}
      </TableCell>
      <TableCell></TableCell>
      <TableCell>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onViewForm(task);
                }}
                disabled={!task.activity_id}
                className="h-7 px-2 text-xs"
              >
                View
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {task.activity_id ? "View submitted form data" : "Form not yet submitted"}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </TableCell>
    </TableRow>
  );
}

