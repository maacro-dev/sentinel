import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from "@/core/components/ui/dialog";
import { Button } from "@/core/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/core/components/ui/form";
import { FormSelect } from "@/core/components/forms/FormSelect";
import { FormDatePicker } from "@/core/components/forms";
import { useAvailableCollectors } from "@/features/users/hooks/useAvailableCollectors";
import { Collection } from "@/features/collection/services/Collection";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { InfoIcon, MapPin } from "lucide-react";
import { Alert, AlertDescription } from "@/core/components/ui/alert";
import { useBatchSchedule } from "../hooks/useBatchSchedule";

const locationScheduleSchema = z.object({
  province: z.string().min(1, "Province is required"),
  city_municipality: z.string().min(1, "Municipality is required"),
  barangay: z.string().min(1, "Barangay is required"),
  collector_id: z.string().uuid(),
  start_date: z.string(),
  end_date: z.string(),
});

export type LocationScheduleInput = z.infer<typeof locationScheduleSchema>;

interface LocationBatchScheduleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  seasonId?: number | null;
  onScheduled: () => void;
}

export function LocationBatchScheduleDialog({
  open,
  onOpenChange,
  seasonId,
  onScheduled,
}: LocationBatchScheduleDialogProps) {

  const seasonAvailable = seasonId != null;
  const [step, setStep] = useState<1 | 2>(1);
  const { data: users, isLoading: usersLoading } = useAvailableCollectors();
  const { mutate: batchSchedule, isPending: isScheduling } = useBatchSchedule();

  const form = useForm<LocationScheduleInput>({
    resolver: zodResolver(locationScheduleSchema),
    defaultValues: {
      province: "",
      city_municipality: "",
      barangay: "",
      collector_id: undefined,
      start_date: new Date().toISOString().slice(0, 10),
      end_date: new Date().toISOString().slice(0, 10),
    },
  });

  const province = form.watch("province");
  const municipality = form.watch("city_municipality");
  const barangay = form.watch("barangay");

  const { data: unscheduledLocations = [], isLoading: loadingLocations } = useQuery({
    queryKey: ["unscheduled-locations", seasonId],
    queryFn: () => Collection.getUnscheduledLocations(seasonId!),   // guaranteed by enabled
    enabled: seasonAvailable,
  });

  const provinces = useMemo(() => {
    const seen = new Set<string>();
    return unscheduledLocations
      .filter(loc => !seen.has(loc.province) && seen.add(loc.province))
      .map(loc => ({ name: loc.province, value: loc.province }));
  }, [unscheduledLocations]);

  const cities = useMemo(() => {
    if (!province) return [];
    const seen = new Set<string>();
    return unscheduledLocations
      .filter(loc => loc.province === province && !seen.has(loc.city_municipality) && seen.add(loc.city_municipality))
      .map(loc => ({ name: loc.city_municipality, value: loc.city_municipality }));
  }, [unscheduledLocations, province]);

  const barangays = useMemo(() => {
    if (!municipality) return [];
    return unscheduledLocations
      .filter(loc => loc.city_municipality === municipality && loc.province === province)
      .map(loc => ({ name: loc.barangay, value: loc.barangay }));
  }, [unscheduledLocations, municipality, province]);

  const { data: unscheduledMfids = [], isLoading: loadingMfids } = useQuery({
    queryKey: ["unscheduled-mfids", seasonId, province, municipality, barangay],
    queryFn: () => Collection.getUnscheduledByLocation(seasonId as number, province, municipality, barangay!),
    enabled: !!barangay && !!province && !!municipality,
  });

  const handleSchedule = (input: LocationScheduleInput) => {
    if (!seasonAvailable || unscheduledMfids.length === 0) return;
    batchSchedule({
      mfids: unscheduledMfids,
      seasonId: seasonId!,
      collectorId: input.collector_id,
      startDate: input.start_date,
      endDate: input.end_date,
    }, {
      onSuccess: () => {
        onScheduled();
        onOpenChange(false);
      },
    });
  };

  useEffect(() => {
    if (!open) {
      form.reset();
      setStep(1);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <Form {...form}>
        <DialogTrigger asChild>
          <Button variant="outline" className="min-w-32 text-xs" >
            <MapPin className="size-3.5" />
            Schedule By Location
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-106.25">
          {!seasonAvailable ? (
            <p className="text-center text-muted-foreground py-8">
              Please select a specific season to use location scheduling.
            </p>
          ) : step === 1 ? (
            <>
              <DialogHeader>
                <DialogTitle>Schedule by Location</DialogTitle>
                <DialogDescription>
                  Select a barangay to schedule all unscheduled MFIDs within it.
                </DialogDescription>
                <Alert>
                  <InfoIcon className="h-4 w-4" />
                  <AlertDescription>
                    Only locations with unscheduled MFIDs are shown.
                  </AlertDescription>
                </Alert>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <FormSelect
                  name="province"
                  label="Province"
                  placeholder="Select a province"
                  options={provinces.map(p => ({ label: p.name, value: p.value }))}
                />
                <FormSelect
                  name="city_municipality"
                  label="City / Municipality"
                  placeholder="Select a municipality"
                  options={cities.map(c => ({ label: c.name, value: c.value }))}
                  disabled={!province}
                />
                <FormSelect
                  name="barangay"
                  label="Barangay"
                  placeholder="Select a barangay"
                  options={barangays.map(b => ({ label: b.name, value: b.value }))}
                  disabled={!municipality}
                />
                {barangay && (
                  <div className="text-sm text-muted-foreground">
                    {loadingMfids ? "Counting unscheduled MFIDs..."
                      : `Found ${unscheduledMfids.length} unscheduled MFID(s) in this barangay.`}
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                <Button
                  onClick={() => setStep(2)}
                  disabled={!barangay || unscheduledMfids.length === 0 || loadingMfids || loadingLocations}
                >
                  Continue with {unscheduledMfids.length} MFIDs
                </Button>
              </DialogFooter>
            </>
          ) : (
            <form onSubmit={form.handleSubmit(handleSchedule)}>
              <DialogHeader>
                <DialogTitle>Schedule {unscheduledMfids.length} MFIDs</DialogTitle>
                <DialogDescription>
                  Assign a collector and date range to schedule all unscheduled MFIDs in{' '}
                  {province}, {municipality}, {barangay}.
                </DialogDescription>
              </DialogHeader>
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
                <Button type="button" variant="outline" onClick={() => setStep(1)}>Back</Button>
                <Button type="submit" disabled={isScheduling}>
                  Schedule All
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Form>
    </Dialog>
  );
}
