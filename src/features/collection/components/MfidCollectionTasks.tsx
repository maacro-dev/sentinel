import { AlertCircle, CalendarClock, CheckCircle2, ChevronRight, Circle, Clock, Edit, XCircle } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/core/components/ui/table";
import { Badge } from "@/core/components/ui/badge";
import { format } from "date-fns";
import { getActivityTypeLabel } from "@/features/forms/utils";
import { useState, useMemo } from "react";
import { CollectionFormDialog } from "./CollectionFormDialog";
import { useCreateCollectionTask } from "../hooks/useCreateCollectionTask";
import { useCollectionTasksByMfid } from "../hooks/useCollectionTaskByMfid";
import { capitalizeFirst } from "@/core/utils/string";
import { ActivityType, CORE_METADATA_TYPES, CoreMetadataType } from "@/features/forms/schemas/forms";
import { Button } from "@/core/components/ui/button";
import { CollectionTask } from "../schemas/collection.schema";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/core/components/ui/tooltip";
import { PREREQUISITE_ORDER } from "./PrerequisiteTracker";
import React from "react";
import { cn } from "@/core/utils/style";
import { useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useUpdateCollectionTask } from "../hooks/useUpdateCollectionTask";

interface MfidCollectionTasksProps {
  mfid: string;
  seasonId?: number;
}

export function MfidCollectionTasks({ mfid, seasonId }: MfidCollectionTasksProps) {
  const queryClient = useQueryClient();
  const { data: allTasks, isLoading } = useCollectionTasksByMfid(mfid);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedFormType, setSelectedFormType] = useState<ActivityType | undefined>();
  const [retakeOriginalTask, setRetakeOriginalTask] = useState<CollectionTask | undefined>();

  const [editingTask, setEditingTask] = useState<CollectionTask | undefined>();
  const { mutate: createTask, isPending: isCreating } = useCreateCollectionTask();

  const { mutate: updateTask, isPending: isUpdating } = useUpdateCollectionTask();

  const navigate = useNavigate();


  const handleCreateTask = (formType: ActivityType) => {
    setSelectedFormType(formType);
    setRetakeOriginalTask(undefined);
    setEditingTask(undefined);
    setDialogOpen(true);
  };

  const handleRetakeTask = (task: CollectionTask) => {
    setRetakeOriginalTask(task);
    setSelectedFormType(undefined);
    setEditingTask(undefined);
    setDialogOpen(true);
  };

  const handleEditTask = (task: CollectionTask) => {
    setEditingTask(task);
    setSelectedFormType(undefined);
    setRetakeOriginalTask(undefined);
    setDialogOpen(true);
  };

  const handleViewForm = (task: CollectionTask) => {
    if (task.activity_id) {
      navigate({
        to: '/forms/$formType/$id',
        params: { formType: task.activity_type, id: task.activity_id },
      });
    }
  };

  const handleCreate = (input: any) => {
    createTask(input, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["collection-tasks", mfid] });
        setDialogOpen(false);
        setSelectedFormType(undefined);
        setRetakeOriginalTask(undefined);
        setEditingTask(undefined);
      }
    });
  };

  const handleUpdate = (input: any) => {
    if (!editingTask) return;
    updateTask({ id: editingTask.id, ...input }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["collection-tasks", mfid] });
        setDialogOpen(false);
        setEditingTask(undefined);
      }
    });
  };


  const tasks = useMemo(() => {
    if (!allTasks) return [];
    if (seasonId) {
      return allTasks.filter((task) => task.season_id === seasonId);
    }
    return allTasks;
  }, [allTasks, seasonId]);

  const groupedTasks = useMemo(() => {
    const groups: Record<CoreMetadataType, CollectionTask[]> = {} as any;
    CORE_METADATA_TYPES.forEach(type => (groups[type] = []));
    tasks.forEach((task) => {
      if (CORE_METADATA_TYPES.includes(task.activity_type as any)) {
        groups[task.activity_type as CoreMetadataType].push(task);
      }
    });
    for (const type of CORE_METADATA_TYPES) {
      groups[type].sort((a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime());
    }
    return groups;
  }, [tasks]);

  const retakeMap = useMemo(() => {
    const map = new Map<number, CollectionTask>();
    tasks.forEach((task) => {
      if (task.retake_of) map.set(task.retake_of, task);
    });
    return map;
  }, [tasks]);

  const isPrerequisiteCompleted = (formType: CoreMetadataType): boolean => {
    const latest = groupedTasks[formType]?.[0];
    if (!latest) return false;

    return latest.status === "completed" && (latest.verification_status === "approved" || latest.verification_status === "unknown");
  };

  const getSchedulability = (formType: CoreMetadataType): { allowed: boolean; reason?: string } => {
    if (formType === "damage-assessment") return { allowed: true };
    const idx = PREREQUISITE_ORDER.indexOf(formType);
    if (idx === -1) return { allowed: false, reason: "Unknown form type" };
    for (let i = 0; i < idx; i++) {
      const prereq = PREREQUISITE_ORDER[i];
      if (!isPrerequisiteCompleted(prereq)) {
        return {
          allowed: false,
          reason: `Must complete collection and approval of "${getActivityTypeLabel(prereq)}" first`,
        };
      }
    }
    return { allowed: true };
  };

  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const toggleGroup = (type: string) => {
    setExpandedGroups(prev => {
      const next = new Set(prev);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      return next;
    });
  };

  const tasksMapForTracker = useMemo(() => {
    const entries = CORE_METADATA_TYPES
      .map(type => {
        const task = groupedTasks[type]?.[0];
        return task ? [type, task] as const : null;
      })
      .filter((entry): entry is readonly [CoreMetadataType, CollectionTask] => entry !== null);
    return new Map(entries);
  }, [groupedTasks]);

  const getStatusForFormType = (formType: CoreMetadataType): {
    icon: React.ReactNode;
    label: string;
    color: string;
  } => {
    const task = tasksMapForTracker.get(formType);
    if (!task) {
      return {
        icon: <Circle className="size-4 text-muted-foreground" />,
        label: "Not started",
        color: "text-muted-foreground",
      };
    }

    const isApproved = task.status === "completed" && (task.verification_status === "approved" || task.verification_status === "unknown");
    const isRejected = task.verification_status === "rejected";
    const hasRetakeScheduled = isRejected && retakeMap.has(task.id) && retakeMap.get(task.id)!.status === "pending";
    const isPendingVerification = task.status === "completed" && task.verification_status === "pending";
    const isInProgress = !isApproved && !isRejected && !isPendingVerification;

    if (isApproved) {
      return {
        icon: <CheckCircle2 className="size-4 text-green-600" />,
        label: "Approved",
        color: "text-green-700",
      };
    }
    if (hasRetakeScheduled) {
      return {
        icon: <CalendarClock className="size-4 text-amber-500" />,
        label: "Retake Scheduled",
        color: "text-amber-600",
      };
    }
    if (isRejected) {
      return {
        icon: <XCircle className="size-4 text-red-600" />,
        label: "Rejected",
        color: "text-red-600",
      };
    }
    if (isPendingVerification) {
      return {
        icon: <Clock className="size-4 text-amber-500" />,
        label: "Pending Approval",
        color: "text-amber-600",
      };
    }
    if (isInProgress) {
      return {
        icon: <AlertCircle className="size-4 text-amber-500" />,
        label: "In Progress",
        color: "text-amber-600",
      };
    }
    return {
      icon: <Circle className="size-4 text-muted-foreground" />,
      label: "Not started",
      color: "text-muted-foreground",
    };
  };

  if (isLoading) {
    return <div className="text-sm text-muted-foreground">Loading tasks...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <CollectionFormDialog
          key={`${selectedFormType}-${retakeOriginalTask?.id}-${editingTask?.id}-${dialogOpen}`}
          open={dialogOpen}
          onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) {
              setSelectedFormType(undefined);
              setRetakeOriginalTask(undefined);
              setEditingTask(undefined);
            }
          }}
          onSubmit={editingTask ? handleUpdate : handleCreate}
          disabled={isCreating || isUpdating}
          mfid={mfid}
          seasonId={seasonId}
          activityType={selectedFormType}
          originalTask={retakeOriginalTask}
          editingTask={editingTask}        // pass editing task if any
          hideTrigger={true}
        />
      </div>

      <div className="border rounded-container overflow-x-auto mt-6">
        <Table>
          <TableHeader className="text-3xs">
            <TableRow>
              <TableHead className="w-2"></TableHead>
              <TableHead></TableHead>
              <TableHead>Form</TableHead>
              <TableHead>Collector</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead>End Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="text-xs">
            {CORE_METADATA_TYPES.map((formType) => {
              const tasksForType = groupedTasks[formType];
              const hasTasks = tasksForType && tasksForType.length > 0;
              const latestTask = hasTasks ? tasksForType[0] : undefined;
              const previousTasks = hasTasks ? tasksForType.slice(1) : [];
              const isExpanded = expandedGroups.has(formType);
              const { allowed, reason } = getSchedulability(formType);
              const status = getStatusForFormType(formType);

              if (!hasTasks) {
                return (
                  <UnscheduledRow
                    key={formType}
                    formType={formType}
                    allowed={allowed}
                    reason={reason}
                    onSchedule={() => handleCreateTask(formType)}
                    status={status}
                  />
                );
              }

              return (
                <React.Fragment key={formType}>
                  <MainTaskRow
                    task={latestTask!}
                    previousCount={previousTasks.length}
                    isExpanded={isExpanded}
                    onToggle={() => toggleGroup(formType)}
                    retakeMap={retakeMap}
                    onRetake={() => handleRetakeTask(latestTask!)}
                    onEdit={() => handleEditTask(latestTask!)}   // pass edit handler
                    status={status}
                    onViewForm={() => handleViewForm(latestTask!)}
                  />
                  {isExpanded &&
                    previousTasks.map((task) => (
                      <PreviousTaskRow
                        key={task.id}
                        task={task}
                        onViewForm={handleViewForm}
                      />
                    ))}
                </React.Fragment>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}


interface UnscheduledRowProps {
  formType: CoreMetadataType;
  allowed: boolean;
  reason?: string;
  onSchedule: () => void;
  status: { icon: React.ReactNode; label: string; color: string };
}

function UnscheduledRow({ formType, allowed, reason, onSchedule, status }: UnscheduledRowProps) {
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


interface MainTaskRowProps {
  task: CollectionTask;
  previousCount: number;
  isExpanded: boolean;
  onToggle: () => void;
  retakeMap: Map<number, CollectionTask>;
  onRetake: () => void;
  onEdit: () => void;                     // new prop
  status: { icon: React.ReactNode; label: string; color: string };
  onViewForm: () => void;
}

function MainTaskRow({ task, previousCount, isExpanded, onToggle, retakeMap, onRetake, onEdit, status, onViewForm }: MainTaskRowProps) {
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

  // Show edit button only if task is not completed (still editable)
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
        <div className="flex flex-col gap-1">
          {/* View button */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onViewForm();
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

          {/* Edit button (only if not completed) */}
          {canEdit && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 px-2 text-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit();
                    }}
                  >
                    <Edit className="size-3 mr-1" />
                    Edit
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Edit task details (dates, collector, etc.)</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}

          {/* Retake button for rejected tasks */}
          {isRejected && !hasPendingRetake && (
            <TooltipProvider>
              <Tooltip delayDuration={300}>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 px-2 text-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRetake();
                    }}
                  >
                    Retake
                  </Button>
                </TooltipTrigger>
                <TooltipContent>This form was rejected. Click to schedule a retake.</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
        {isRejected && hasPendingRetake && (
          <TooltipProvider>
            <Tooltip delayDuration={300}>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm" disabled>Retake</Button>
              </TooltipTrigger>
              <TooltipContent>
                A retake is already scheduled (due {format(new Date(retakeTask!.end_date), "MMM d, yyyy")}).
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </TableCell>
    </TableRow>
  );
}


interface PreviousTaskRowProps {
  task: CollectionTask;
  onViewForm: (task: CollectionTask) => void;
  isExpanded?: boolean;
}

function PreviousTaskRow({ task, onViewForm }: PreviousTaskRowProps) {
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
