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
  onSubmit: (input: CollectionTaskInput) => void;
  disabled?: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mfid?: string;
  seasonId?: number;
  activityType?: ActivityType;
  originalTask?: CollectionTask;
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
  hideTrigger = false,
}: CollectionFormDialogProps) {
  const { data: currentSeasonId } = useCurrentSeasonId();

  const { data: users, isLoading: usersLoading, error: usersError } = useAvailableCollectors();
  const { data: mfids, isLoading: mfidsLoading, error: mfidsError } = useMfids();

  const isRetake = !!originalTask;

  const defaultValues = useMemo(() => {
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
  }, [isRetake, originalTask, presetMfid, presetSeasonId, currentSeasonId, presetActivityType]);

  const form = useForm<CollectionTaskInput>({
    resolver: zodResolver(collectionTaskInputSchema),
    defaultValues,
  });

  useEffect(() => {
    if (open) {
      if (originalTask) {
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
  }, [open, originalTask, form, presetMfid, presetSeasonId, currentSeasonId, presetActivityType]);

  useEffect(() => {
    if (!isRetake && users && users.length > 0 && !form.getValues().collector_id) {
      form.setValue("collector_id", users[0].id);
    }
  }, [users, form, isRetake]);

  const handleSubmit = (input: CollectionTaskInput) => {
    const payload = isRetake && originalTask
      ? { ...input, retake_of: originalTask.id }
      : input;
    onSubmit(payload);
    form.reset();
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen && !canOpen) return;
    if (!isOpen) form.reset();
    onOpenChange(isOpen);
  };

  const showMfidField = !presetMfid && !isRetake;
  const showActivityTypeField = !presetActivityType && !isRetake;

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
                    <Plus /> Create Task
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
              <Plus /> Create Task
            </Button>
          )
        )}
      </TooltipProvider>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-106.25">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)}>
              <DialogHeader className="mb-4">
                <DialogTitle>{isRetake ? "Schedule Retake" : "Create Collection Task"}</DialogTitle>
                <DialogDescription>
                  {isRetake
                    ? "Schedule a new collection task to retake this rejected form. The collector will see it in their pending list."
                    : "Assign a data collector to collect a specific form within a date range."}
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-4 py-4">
                {showMfidField && (
                  <FormSelect
                    name="mfid"
                    label="MFID"
                    placeholder="Select mfid"
                    options={mfids.map((m) => ({ label: m.mfid, value: m.mfid }))}
                  />
                )}

                {showActivityTypeField && (
                  <FormSelect
                    name="activity_type"
                    label="Form Type"
                    placeholder="Select form type"
                    options={activityTypeSchema.options.map((form) => ({
                      label: getActivityTypeLabel(form),
                      value: form,
                    }))}
                  />
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
                    {isRetake ? "Schedule Retake" : "Create"}
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
