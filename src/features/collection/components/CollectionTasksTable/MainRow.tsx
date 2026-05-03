
import { ChevronRight, Edit, Eye, RotateCcw, Trash2 } from "lucide-react";
import { TableCell, TableRow } from "@/core/components/ui/table";
import { Badge } from "@/core/components/ui/badge";
import { format } from "date-fns";
import { getActivityTypeLabel } from "@/features/forms/utils";
import { capitalizeFirst } from "@/core/utils/string";
import { Button } from "@/core/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/core/components/ui/tooltip";
import React from "react";
import { cn } from "@/core/utils/style";
import { CollectionTask } from "../../schemas/collection.schema";


interface TaskMainRowProps {
  task: CollectionTask;
  previousCount: number;
  isExpanded: boolean;
  onToggle: () => void;
  retakeMap: Map<number, CollectionTask>;
  onRetake: () => void;
  onEdit: () => void;
  status: { icon: React.ReactNode; label: string; color: string };
  onViewForm: () => void;
  onDelete: () => void;
}

export function TaskMainRow({ task, previousCount, isExpanded, onToggle, retakeMap, onRetake, onEdit, status, onViewForm, onDelete }: TaskMainRowProps) {
  const isRejected = task.verification_status === "rejected";
  const retakeTask = isRejected ? retakeMap.get(task.id) : undefined;
  const hasPendingRetake = retakeTask && retakeTask.status === "pending";
  const statusText = task.is_overdue ? "Overdue" : capitalizeFirst(task.status);
  const badgeVariant = task.is_overdue
    ? "destructive"
    : task.status === "completed"
      ? "default"
      : "warning";
  const isRetake = !!task.retake_of;

  const canEdit = task.status !== "completed";

  return (
    <TableRow
      className={cn(
        "last:border-b-0 transition-colors",
        previousCount > 0 && "cursor-pointer hover:bg-muted/50"
      )}
      onClick={() => previousCount > 0 && onToggle()}
    >
      <TableCell className="max-w-6">
        {previousCount > 0 && (
          <span className="inline-flex transition-transform duration-200 ease-out">
            <ChevronRight
              className={cn(
                "size-4 text-muted-foreground transition-transform duration-200",
                isExpanded && "rotate-90"
              )}
            />
          </span>
        )}
      </TableCell>
      <TableCell className="w-32">
        <div className="flex flex-col items-center gap-1">
          {status.icon}
          <span className={`text-xs ${status.color}`}>{status.label}</span>
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <span>{getActivityTypeLabel(task.activity_type)}</span>
          {isRetake && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge variant="secondary" className="text-xs bg-amber-100 text-amber-800">Retake</Badge>
                </TooltipTrigger>
                <TooltipContent>This task is a retake of a previously rejected form.</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </TableCell>
      <TableCell>{task.collector_name ?? "Unassigned"}</TableCell>
      <TableCell>{format(new Date(task.start_date), "MMM d, yyyy")}</TableCell>
      <TableCell>{format(new Date(task.end_date), "MMM d, yyyy")}</TableCell>
      <TableCell>
        <div className="flex items-center gap-2 flex-wrap">
          {isRejected && <Badge variant="destructive" className="w-24 py-1 bg-red-600">Rejected</Badge>}
          {hasPendingRetake && (
            <Badge variant="secondary" className="bg-amber-100 text-amber-800">Retake Scheduled</Badge>
          )}
          {!isRejected && !hasPendingRetake && (
            <Badge className="w-24 py-1" variant={badgeVariant}>{statusText}</Badge>
          )}
        </div>
      </TableCell>
      <TableCell>
        <div className="flex gap-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={(e) => {
                    e.stopPropagation();
                    onViewForm();
                  }}
                  disabled={!task.activity_id}
                >
                  <Eye className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {task.activity_id ? "View submitted form data" : "Form not yet submitted"}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {canEdit && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit();
                    }}
                  >
                    <Edit className="size-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Edit task details (dates, collector, etc.)</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}

          {canEdit && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8 text-red-600 hover:text-red-700"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete();
                    }}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Delete this task</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}

          {isRejected && !hasPendingRetake && (
            <TooltipProvider>
              <Tooltip delayDuration={300}>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 gap-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRetake();
                    }}
                  >
                    <RotateCcw className="size-3" />
                    Retake
                  </Button>
                </TooltipTrigger>
                <TooltipContent>This form was rejected. Click to schedule a retake.</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
        {/* Retake scheduled message (unchanged) */}
      </TableCell>
    </TableRow >
  );
}
