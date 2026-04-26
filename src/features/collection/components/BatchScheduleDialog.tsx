import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/core/components/ui/dialog";
import { Button } from "@/core/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/core/components/ui/form";
import { FormSelect } from "@/core/components/forms/FormSelect";
import { FormDatePicker } from "@/core/components/forms";
import { useAvailableCollectors } from "@/features/users/hooks/useAvailableCollectors";
import { z } from "zod";
import { useEffect } from "react";
import { Alert, AlertTitle, AlertDescription } from "@/core/components/ui/alert";
import { InfoIcon } from "lucide-react";

const batchSchema = z.object({
  collector_id: z.string().uuid(),
  start_date: z.string(),
  end_date: z.string(),
});

export type BatchScheduleInput = z.infer<typeof batchSchema>;

interface BatchScheduleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (input: BatchScheduleInput) => void;
  disabled?: boolean;
  mfidCount: number;
  shouldShowTrigger?: boolean;
  selectedCount: number;
  scheduledMfids?: string[];
  locationWarning?: boolean;
  locations?: {
    provinces: string[];
    municipalities: string[];
  };
  canSchedule?: boolean;
}

export function BatchScheduleDialog({
  open,
  onOpenChange,
  onSubmit,
  disabled,
  mfidCount,
  shouldShowTrigger,
  selectedCount,
  scheduledMfids = [],
  locationWarning,
  locations,
  canSchedule
}: BatchScheduleDialogProps) {
  const { data: users, isLoading: usersLoading } = useAvailableCollectors();
  const form = useForm<BatchScheduleInput>({
    resolver: zodResolver(batchSchema),
    defaultValues: {
      collector_id: undefined,
      start_date: new Date().toISOString().slice(0, 10),
      end_date: new Date().toISOString().slice(0, 10),
    },
  });

  useEffect(() => {
    if (users && users.length > 0 && !form.getValues().collector_id) {
      form.setValue("collector_id", users[0].id);
    }
  }, [users, form]);

  useEffect(() => {
    if (open) {
      form.reset({
        collector_id: users?.[0]?.id ?? undefined,
        start_date: new Date().toISOString().slice(0, 10),
        end_date: new Date().toISOString().slice(0, 10),
      });
    }
  }, [open, form, users]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {shouldShowTrigger && (
        <DialogTrigger asChild>
          <Button
            className="min-w-32 text-xs"
            variant='outline'
          >
            Schedule Field Data ({selectedCount})
          </Button>
        </DialogTrigger>
      )}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Schedule Field Data</DialogTitle>
          <DialogDescription>
            Schedule field data (and automatically the remaining core tasks) for {mfidCount} selected monitoring
            field IDs. They will be assigned the same collector and dates.
          </DialogDescription>
        </DialogHeader>

        {!canSchedule && selectedCount > 0 && (
          <Alert variant="destructive">
            <InfoIcon className="h-4 w-4" />
            <AlertTitle>Cannot schedule across provinces</AlertTitle>
            <AlertDescription>
              All selected MFIDs must be in the same province to assign one collector.
              Please narrow your selection.
              {locations && locations.provinces.length > 1 && (
                <p className="mt-1">Provinces selected: {locations.provinces.join(', ')}</p>
              )}
            </AlertDescription>
          </Alert>
        )}

        {canSchedule && locationWarning && (
          <Alert variant="warning">
            <InfoIcon className="h-4 w-4" />
            <AlertTitle>Multiple municipalities selected</AlertTitle>
            <AlertDescription>
              You are scheduling the same collector for multiple municipalities. Ensure the
              collector can travel between them within the given dates.
              {locations && locations.municipalities.length > 1 && (
                <p className="mt-1">Municipalities: {locations.municipalities.join(', ')}</p>
              )}
            </AlertDescription>
          </Alert>
        )}

        {scheduledMfids.length > 0 && (
          <Alert variant="warning">
            <InfoIcon className="h-4 w-4" />
            <AlertTitle>Some MFIDs already scheduled</AlertTitle>
            <AlertDescription>
              The following MFIDs already have a schedule and will be skipped:
              <ul className="list-disc pl-4 mt-1">
                {scheduledMfids.slice(0, 5).map((mfid) => (
                  <li key={mfid}>{mfid}</li>
                ))}
                {scheduledMfids.length > 5 && (
                  <li>... and {scheduledMfids.length - 5} more</li>
                )}
              </ul>
            </AlertDescription>
          </Alert>
        )}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="grid gap-4 py-4">
              <FormSelect
                name="collector_id"
                label="Collector"
                disabled={usersLoading}
                placeholder={usersLoading ? "Loading..." : "Select collector"}
                options={
                  users?.map(user => ({
                    label: `${user.first_name} ${user.last_name}`,
                    value: user.id,
                  })) ?? []
                }
              />
              <FormDatePicker name="start_date" label="Start Date" />
              <FormDatePicker name="end_date" label="End Date" />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={disabled}>
                Schedule All
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog >
  );
}
