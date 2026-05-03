
import { TableCell, TableRow } from "@/core/components/ui/table";
import { getActivityTypeLabel } from "@/features/forms/utils";
import { CoreMetadataType } from "@/features/forms/schemas/forms";
import { Button } from "@/core/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/core/components/ui/tooltip";
import React from "react";


interface TaskUnscheduledRowProps {
  formType: CoreMetadataType;
  allowed: boolean;
  reason?: string;
  onSchedule: () => void;
  status: { icon: React.ReactNode; label: string; color: string };
}

export function TaskUnscheduledRow({ formType, allowed, reason, onSchedule, status }: TaskUnscheduledRowProps) {
  const button = (
    <Button className="w-24 py-1 text-xs" variant="outline" size="sm" onClick={onSchedule} disabled={!allowed}>
      Schedule
    </Button>
  );

  return (
    <TableRow className="last:border-b-0 text-muted-foreground">
      <TableCell></TableCell>
      <TableCell>
        <div className="flex flex-col items-center gap-1">
          {status.icon}
          <span className={`text-xs ${status.color}`}>{status.label}</span>
        </div>
      </TableCell>
      <TableCell>{getActivityTypeLabel(formType)}</TableCell>
      <TableCell colSpan={2}>—</TableCell>
      <TableCell>—</TableCell>
      <TableCell>
        <div className="flex flex-col gap-1">
          {allowed ? (
            button
          ) : (
            <TooltipProvider>
              <Tooltip delayDuration={300}>
                <TooltipTrigger asChild>{button}</TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">{reason}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </TableCell>
      <TableCell></TableCell>
    </TableRow>
  );
}
