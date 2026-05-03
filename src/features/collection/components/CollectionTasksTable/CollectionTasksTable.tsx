
import { AlertCircle, CalendarClock, CheckCircle2, Circle, Clock, XCircle } from "lucide-react";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/core/components/ui/table";
import { getActivityTypeLabel } from "@/features/forms/utils";
import { useState, useMemo } from "react";
import { ActivityType, CORE_METADATA_TYPES, CoreMetadataType } from "@/features/forms/schemas/forms";
import React from "react";
import { CollectionTask } from "../../schemas/collection.schema";
import { TaskUnscheduledRow } from "./UnscheduledRow";
import { PREREQUISITE_ORDER } from "../../services/config";
import { TaskMainRow } from "./MainRow";
import { TaskPreviousRow } from "./PreviousRow";

interface TaskTableProps {
  seasonId: number;
  tasks: CollectionTask[];
  onCreate: (formType: ActivityType, seasonId: number) => void;
  onRetake: (task: CollectionTask) => void;
  onEdit: (task: CollectionTask) => void;
  onView: (task: CollectionTask) => void;
  onDelete: (task: CollectionTask) => void;
}

export function CollectionTasksTable({
  seasonId,
  tasks,
  onCreate,
  onRetake,
  onEdit,
  onView,
  onDelete,
}: TaskTableProps) {
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

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
    if (formType === "damage-assessment") {
      if (!isPrerequisiteCompleted("field-data")) {
        return { allowed: false, reason: "Must complete collection and approval of Field Data first" };
      }
      return { allowed: true };
    }

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

  const getStatusForFormType = (formType: CoreMetadataType) => {
    const task = tasksMapForTracker.get(formType);
    if (!task) return { icon: <Circle className="size-4 text-muted-foreground" />, label: "Not started", color: "text-muted-foreground" };

    const isApproved = task.status === "completed" && (task.verification_status === "approved" || task.verification_status === "unknown");
    const isRejected = task.verification_status === "rejected";
    const hasRetakeScheduled = isRejected && retakeMap.has(task.id) && retakeMap.get(task.id)!.status === "pending";
    const isPendingVerification = task.status === "completed" && task.verification_status === "pending";
    const isInProgress = !isApproved && !isRejected && !isPendingVerification;

    if (isApproved) return { icon: <CheckCircle2 className="size-4 text-green-600" />, label: "Approved", color: "text-green-700" };
    if (hasRetakeScheduled) return { icon: <CalendarClock className="size-4 text-amber-500" />, label: "Retake Scheduled", color: "text-amber-600" };
    if (isRejected) return { icon: <XCircle className="size-4 text-red-600" />, label: "Rejected", color: "text-red-600" };
    if (isPendingVerification) return { icon: <Clock className="size-4 text-amber-500" />, label: "Pending Approval", color: "text-amber-600" };
    if (isInProgress) return { icon: <AlertCircle className="size-4 text-amber-500" />, label: "In Progress", color: "text-amber-600" };
    return { icon: <Circle className="size-4 text-muted-foreground" />, label: "Not started", color: "text-muted-foreground" };
  };

  return (
    <div className="border rounded-container overflow-x-auto mt-4">
      <Table>
        <TableHeader className="text-3xs">
          <TableRow>
            <TableHead className="w-2"></TableHead>
            <TableHead>Verification Status</TableHead>
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
            const tasksForType = groupedTasks[formType] || [];
            const hasTasks = tasksForType.length > 0;
            const latestTask = hasTasks ? tasksForType[0] : undefined;
            const previousTasks = hasTasks ? tasksForType.slice(1) : [];
            const isExpanded = expandedGroups.has(formType);
            const { allowed, reason } = getSchedulability(formType);
            const status = getStatusForFormType(formType);

            if (!hasTasks) {
              return (
                <TaskUnscheduledRow
                  key={formType}
                  formType={formType}
                  allowed={allowed}
                  reason={reason}
                  onSchedule={() => onCreate(formType, seasonId)}
                  status={status}
                />
              );
            }

            return (
              <React.Fragment key={formType}>
                <TaskMainRow
                  task={latestTask!}
                  previousCount={previousTasks.length}
                  isExpanded={isExpanded}
                  onToggle={() => toggleGroup(formType)}
                  retakeMap={retakeMap}
                  onRetake={() => onRetake(latestTask!)}
                  onEdit={() => onEdit(latestTask!)}
                  status={status}
                  onViewForm={() => onView(latestTask!)}
                  onDelete={() => onDelete(latestTask!)}
                />
                {isExpanded &&
                  previousTasks.map((task) => (
                    <TaskPreviousRow
                      key={task.id}
                      task={task}
                      onViewForm={onView}
                    />
                  ))}
              </React.Fragment>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
