import { Button } from "@/core/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/core/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/core/components/ui/tooltip";
import { Plus } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/core/components/ui/form";
import { ActivityType, activityTypeSchema } from "@/features/forms/schemas/forms";
import { getActivityTypeLabel } from "@/features/forms/utils";
import { useCurrentSeasonId } from "@/features/fields/hooks/useSeasons";
import { CollectionTaskInput, collectionTaskInputSchema } from "../schemas/collection.schema";
import { useAvailableCollectors } from "@/features/users/hooks/useAvailableCollectors";
import { useMfids } from "@/features/mfid/hooks/useMfids";
import { useEffect, useMemo } from "react";
import { FormDatePicker } from "@/core/components/forms";
import { FormSelect } from "@/core/components/forms/FormSelect";
import { CollectionTask } from "../schemas/collection.schema";

interface CollectionFormDialogProps {
  onSubmit: (input: CollectionTaskInput | (CollectionTaskInput & { id: number })) => void;
  disabled?: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mfid?: string;
  seasonId?: number;
  activityType?: ActivityType;
  originalTask?: CollectionTask;
  editingTask?: CollectionTask;    // new: task to edit
  hideTrigger?: boolean;
}

export function CollectionFormDialog({
  onSubmit,
  disabled,
  open,
  onOpenChange,
  mfid: presetMfid,
  seasonId: presetSeasonId,
  activityType: presetActivityType,
  originalTask,
  editingTask,
  hideTrigger = false,
}: CollectionFormDialogProps) {
  const { data: currentSeasonId } = useCurrentSeasonId();

  const { data: users, isLoading: usersLoading, error: usersError } = useAvailableCollectors();
  const { data: mfids, isLoading: mfidsLoading, error: mfidsError } = useMfids();

  const isRetake = !!originalTask;
  const isEditing = !!editingTask;

  // Determine default values: edit > retake > new
  const defaultValues = useMemo(() => {
    if (isEditing && editingTask) {
      return {
        mfid: editingTask.mfid,
        season_id: editingTask.season_id,
        activity_type: editingTask.activity_type as ActivityType,
        collector_id: editingTask.collector_id,
        start_date: editingTask.start_date,
        end_date: editingTask.end_date,
      };
    }
    if (isRetake && originalTask) {
      return {
        mfid: originalTask.mfid,
        season_id: originalTask.season_id,
        activity_type: originalTask.activity_type as ActivityType,
        collector_id: originalTask.collector_id,
        start_date: originalTask.start_date,
        end_date: originalTask.end_date,
      };
    }
    return {
      mfid: presetMfid || "",
      season_id: presetSeasonId ?? currentSeasonId ?? undefined,
      activity_type: presetActivityType ?? activityTypeSchema.options[0],
      collector_id: undefined,
      start_date: new Date().toISOString().slice(0, 10),
      end_date: new Date().toISOString().slice(0, 10),
    };
  }, [isEditing, editingTask, isRetake, originalTask, presetMfid, presetSeasonId, currentSeasonId, presetActivityType]);

  const form = useForm<CollectionTaskInput>({
    resolver: zodResolver(collectionTaskInputSchema),
    defaultValues,
  });

  useEffect(() => {
    if (open) {
      if (isEditing && editingTask) {
        form.reset({
          mfid: editingTask.mfid,
          season_id: editingTask.season_id,
          activity_type: editingTask.activity_type as ActivityType,
          collector_id: editingTask.collector_id,
          start_date: editingTask.start_date,
          end_date: editingTask.end_date,
        });
      } else if (isRetake && originalTask) {
        form.reset({
          mfid: originalTask.mfid,
          season_id: originalTask.season_id,
          activity_type: originalTask.activity_type as ActivityType,
          collector_id: originalTask.collector_id,
          start_date: originalTask.start_date,
          end_date: originalTask.end_date,
        });
      } else {
        form.reset({
          mfid: presetMfid || "",
          season_id: presetSeasonId ?? currentSeasonId ?? undefined,
          activity_type: presetActivityType ?? activityTypeSchema.options[0],
          collector_id: undefined,
          start_date: new Date().toISOString().slice(0, 10),
          end_date: new Date().toISOString().slice(0, 10),
        });
      }
    }
  }, [open, isEditing, editingTask, isRetake, originalTask, form, presetMfid, presetSeasonId, currentSeasonId, presetActivityType]);

  // Auto-select first collector for new tasks
  useEffect(() => {
    if (!isRetake && !isEditing && users && users.length > 0 && !form.getValues().collector_id) {
      form.setValue("collector_id", users[0].id);
    }
  }, [users, form, isRetake, isEditing]);

  const handleSubmit = (input: CollectionTaskInput) => {
    if (isEditing && editingTask) {
      // For edit, include the task id
      onSubmit({ id: editingTask.id, ...input });
    } else if (isRetake && originalTask) {
      onSubmit({ ...input, retake_of: originalTask.id });
    } else {
      onSubmit(input);
    }
    form.reset();
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen && !canOpen) return;
    if (!isOpen) form.reset();
    onOpenChange(isOpen);
  };

  const showMfidField = !presetMfid && !isRetake && !isEditing;
  const showActivityTypeField = !presetActivityType && !isRetake && !isEditing;

  const isLoading = usersLoading || (showMfidField && mfidsLoading);
  const hasCollectors = users && users.length > 0;
  const hasMfids = mfids && mfids.length > 0;

  const canOpen = (showMfidField ? (hasMfids || mfidsError) : true) && (hasCollectors || usersError);

  const disabledTooltip = useMemo(() => {
    if (isLoading) return "";
    if (usersError) return "Could not load collectors. Please try again later.";
    if (!hasCollectors) return "No data collectors available to assign";
    if (showMfidField && mfidsError) return "Could not load MFIDs. Please try again later.";
    if (showMfidField && !hasMfids) return "No MFIDs available to select";
    return "";
  }, [isLoading, hasCollectors, showMfidField, hasMfids, usersError, mfidsError]);

  const buttonDisabled = disabled || isLoading || (!canOpen && !usersError && !mfidsError);
  const isSubmitDisabled = disabled || !hasCollectors || !form.formState.isValid;

  // Determine dialog title and submit button text
  const dialogTitle = isEditing ? "Edit Collection Task" : (isRetake ? "Schedule Retake" : "Create Collection Task");
  const dialogDescription = isEditing
    ? "Update the collector or date range for this task."
    : (isRetake
        ? "Schedule a new collection task to retake this rejected form. The collector will see it in their pending list."
        : "Assign a data collector to collect a specific form within a date range.");
  const submitButtonText = isEditing ? "Save Changes" : (isRetake ? "Schedule Retake" : "Create");

  return (
    <>
      <TooltipProvider>
        {!hideTrigger && (
          buttonDisabled ? (
            <Tooltip delayDuration={300}>
              <TooltipTrigger asChild>
                <span tabIndex={0} className="inline-block">
                  <Button
                    variant="default"
                    disabled={buttonDisabled}
                    className="min-w-32 text-xs"
                  >
                    <Plus /> {isEditing ? "Edit Task" : "Create Task"}
                  </Button>
                </span>
              </TooltipTrigger>
              {disabledTooltip && (
                <TooltipContent>
                  <p className="text-xs">{disabledTooltip}</p>
                </TooltipContent>
              )}
            </Tooltip>
          ) : (
            <Button
              variant="default"
              disabled={buttonDisabled}
              className="min-w-32 text-xs"
              onClick={() => onOpenChange(true)}
            >
              <Plus /> {isEditing ? "Edit Task" : "Create Task"}
            </Button>
          )
        )}
      </TooltipProvider>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-106.25">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)}>
              <DialogHeader className="mb-4">
                <DialogTitle>{dialogTitle}</DialogTitle>
                <DialogDescription>{dialogDescription}</DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-4">
                {/* MFID field – disabled when editing or retake or preset */}
                {showMfidField ? (
                  <FormSelect
                    name="mfid"
                    label="MFID"
                    placeholder="Select mfid"
                    options={mfids.map((m) => ({ label: m.mfid, value: m.mfid }))}
                  />
                ) : (isEditing || isRetake) && (
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium">MFID</label>
                    <input
                      type="text"
                      value={isEditing ? editingTask!.mfid : originalTask!.mfid}
                      disabled
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </div>
                )}

                {/* Activity Type field – disabled when editing or retake or preset */}
                {showActivityTypeField ? (
                  <FormSelect
                    name="activity_type"
                    label="Form Type"
                    placeholder="Select form type"
                    options={activityTypeSchema.options.map((form) => ({
                      label: getActivityTypeLabel(form),
                      value: form,
                    }))}
                  />
                ) : (isEditing || isRetake) && (
                  <div className="flex flex-col gap-1">
                    <label className="text-sm font-medium">Form Type</label>
                    <input
                      type="text"
                      value={getActivityTypeLabel(isEditing ? editingTask!.activity_type as ActivityType : originalTask!.activity_type as ActivityType)}
                      disabled
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </div>
                )}

                <FormSelect
                  name="collector_id"
                  label="Collector"
                  disabled={usersLoading || !hasCollectors}
                  placeholder={usersLoading ? "Loading collectors..." : hasCollectors ? "Select a collector" : "No collectors available"}
                  options={
                    hasCollectors ? users.map((user) => ({
                      label: `${user.first_name} ${user.last_name}`,
                      value: user.id,
                    }))
                      : []
                  }
                />

                <FormDatePicker name="start_date" label="Start Date" />
                <FormDatePicker name="end_date" label="End Date" />
              </div>

              <DialogFooter className="mt-4">
                <div className="flex flex-col gap-2 w-full">
                  <Button
                    className="w-full"
                    type="button"
                    variant="outline"
                    onClick={() => handleOpenChange(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="w-full"
                    type="submit"
                    disabled={isSubmitDisabled}
                  >
                    {submitButtonText}
                  </Button>
                </div>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
