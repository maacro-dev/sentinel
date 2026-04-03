import { CheckCircle2, Circle, Lock, AlertCircle, XCircle, Clock, CalendarClock } from "lucide-react";
import { CollectionTask } from "../schemas/collection.schema";
import type { CoreMetadataType } from "@/features/forms/schemas/forms";


export const PREREQUISITE_ORDER: CoreMetadataType[] = [
  "field-data",
  "cultural-management",
  "nutrient-management",
  "production",
];

interface PrerequisiteTrackerProps {
  tasksMap: Map<CoreMetadataType, CollectionTask>;
  retakeMap: Map<number, CollectionTask>;
}

export function PrerequisiteTracker({ tasksMap, retakeMap }: PrerequisiteTrackerProps) {
  const steps = [
    { type: "field-data", label: "Field Data" },
    { type: "cultural-management", label: "Cultural Management" },
    { type: "nutrient-management", label: "Nutrient Management" },
    { type: "production", label: "Production" },
  ] as const;

  let isBlocked = false;
  const stepStatuses = steps.map((step) => {
    const task = tasksMap.get(step.type);
    const hasTask = !!task;
    const isApproved = hasTask && task.status === "completed" && task.verification_status === "approved";
    const isRejected = hasTask && task.verification_status === "rejected";
    const hasRetakeScheduled = isRejected && retakeMap.has(task.id) && retakeMap.get(task.id)!.status === "pending";
    const isPendingVerification = hasTask && task.status === "completed" && task.verification_status === "pending";
    const isInProgress = hasTask && !isApproved && !isRejected && !isPendingVerification;
    const isBlockedNow = isBlocked;
    if (!isApproved && !hasRetakeScheduled) isBlocked = true;
    return { ...step, isApproved, isRejected, hasRetakeScheduled, isPendingVerification, isInProgress, isBlocked: isBlockedNow };
  });

  const damageTask = tasksMap.get("damage-assessment");
  const damageApproved = damageTask?.status === "completed" && damageTask.verification_status === "approved";
  const damageRejected = damageTask?.verification_status === "rejected";
  const damageHasRetakeScheduled = damageRejected && retakeMap.has(damageTask.id) && retakeMap.get(damageTask.id)!.status === "pending";
  const damagePendingVerification = damageTask?.status === "completed" && damageTask.verification_status === "pending";

  return (
    <div className="rounded-container p-4 mb-6 bg-muted/5">
      {/* <h4 className="text-sm font-medium mb-3">Collection Status</h4> */}
      <div className="flex items-start gap-x-2 gap-y-3 flex-wrap justify-center">
        {stepStatuses.map((step, idx) => (
          <div key={step.type} className="flex items-center">
            <div className="flex flex-col items-center min-w-20">
              <div className="flex items-center gap-1">
                {step.isApproved ? (
                  <CheckCircle2 className="size-4 text-green-600" />
                ) : step.hasRetakeScheduled ? (
                  <CalendarClock className="size-4 text-amber-500" />
                ) : step.isRejected ? (
                  <XCircle className="size-4 text-red-600" />
                ) : step.isPendingVerification ? (
                  <Clock className="size-4 text-amber-500" />
                ) : step.isBlocked ? (
                  <Lock className="size-4 text-muted-foreground" />
                ) : step.isInProgress ? (
                  <AlertCircle className="size-4 text-amber-500" />
                ) : (
                  <Circle className="size-4 text-muted-foreground" />
                )}
                <span className={`text-xs font-medium ${
                  step.isApproved ? "text-green-700" :
                  step.hasRetakeScheduled ? "text-amber-600" :
                  step.isRejected ? "text-red-600" :
                  step.isPendingVerification ? "text-amber-600" :
                  step.isBlocked ? "text-muted-foreground" :
                  "text-foreground"
                }`}>
                  {step.label}
                </span>
              </div>
              <div className="text-[10px] text-muted-foreground mt-0.5">
                {step.isApproved ? "Approved" :
                 step.hasRetakeScheduled ? "Retake Scheduled" :
                 step.isRejected ? "Rejected" :
                 step.isPendingVerification ? "Pending Approval" :
                 step.isBlocked ? "Blocked" :
                 step.isInProgress ? "In Progress" :
                 "Not started"}
              </div>
            </div>
            {idx < steps.length - 1 && (
              <div className="w-6 h-px bg-border mx-1" />
            )}
          </div>
        ))}
        {/* Damage assessment – always optional */}
        <div className="ml-4 pl-4 border-l border-dashed flex items-center gap-1">
          {damageApproved ? (
            <CheckCircle2 className="size-4 text-green-600" />
          ) : damageHasRetakeScheduled ? (
            <CalendarClock className="size-4 text-amber-500" />
          ) : damageRejected ? (
            <XCircle className="size-4 text-red-600" />
          ) : damagePendingVerification ? (
            <Clock className="size-4 text-amber-500" />
          ) : (
            <Circle className="size-4 text-muted-foreground" />
          )}
          <span className="text-xs font-medium">Damage Assessment</span>
          <span className="text-[10px] text-muted-foreground ml-1">
            (optional)
          </span>
        </div>
      </div>
    </div>
  );
}
