import { memo, useState, useMemo } from "react";
import { Calendar, Info } from "lucide-react";
import { Button } from "@/core/components/ui/button";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/core/components/ui/command";
import { Checkbox } from "@/core/components/ui/checkbox";
import { cn } from "@/core/utils/style";
import { useCurrentSeason, useSeasonsForSelector } from "@/features/fields/hooks/useSeasons";

interface SeasonPickerProps {
  values?: number[];
  onChange: (seasonIds: number[]) => void;
  maxSelections?: number;
  disabled?: boolean;
}

export const SeasonPicker = memo(({ values = [], onChange, maxSelections = 3, disabled }: SeasonPickerProps) => {
  const [open, setOpen] = useState(false);
  const { options: seasonOptionsData, isLoading: loadingOptions } = useSeasonsForSelector(false);
  const { selected: currentSeason, isLoading: loadingCurrent } = useCurrentSeason();

  const seasonOptions = useMemo(() => {
    if (!seasonOptionsData || !currentSeason) return [];
    if (currentSeason.id !== undefined && currentSeason.id !== null) {
      return seasonOptionsData.filter(opt => Number(opt.value) !== Number(currentSeason.id));
    }
    return seasonOptionsData;
  }, [seasonOptionsData, currentSeason]);

  const selectedSeasons = useMemo(() =>
    values
      .map(id => seasonOptionsData?.find(opt => Number(opt.value) === id))
      .filter(Boolean) as Array<{ value: string; label: string }>,
    [values, seasonOptionsData]
  );

  const handleToggle = (val: string) => {
    const id = Number(val);
    if (values.includes(id)) {
      onChange(values.filter(v => v !== id));
    } else {
      if (values.length >= maxSelections) return;
      onChange([...values, id]);
    }
  };

  // const handleRemove = (id: number) => {
  //   onChange(values.filter(v => v !== id));
  // };

  const isLoading = loadingOptions || loadingCurrent;
  const atMax = values.length >= maxSelections;

  const triggerLabel = selectedSeasons.length === 0
    ? "Compare seasons…"
    : `${selectedSeasons.length} season${selectedSeasons.length > 1 ? "s" : ""} selected`;

  return (
    <>
      <div className="flex flex-col gap-1.5">
        <Button
          variant="outline"
          className="shadow-none min-w-40 py-2! rounded-sm h-9 text-2xs lt:text-4xs dt:text-3xs hd:text-2xs text-primary/90 justify-start gap-2"
          onClick={() => setOpen(true)}
          disabled={disabled || isLoading}
        >
          <Calendar className="size-3 shrink-0" />
          <span className="truncate">{triggerLabel}</span>
        </Button>

        {/* {selectedSeasons.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {selectedSeasons.map(s => (
              <Badge
                key={s.value}
                variant="secondary"
                className="text-3xs gap-1 pr-1 h-5 font-normal"
              >
                <span className="truncate max-w-24">{s.label}</span>
                <button
                  onClick={() => handleRemove(Number(s.value))}
                  className="ml-0.5 rounded-full hover:bg-muted-foreground/20 p-0.5"
                  aria-label={`Remove ${s.label}`}
                >
                  <X className="size-2.5" />
                </button>
              </Badge>
            ))}
          </div>
        )} */}
      </div>

      <CommandDialog open={open} onOpenChange={setOpen} className="w-lg max-w-full">
        <CommandInput placeholder="Search seasons..." />
        {atMax && (
          <p className="px-3 py-1.5 text-2xs text-muted-foreground border-b">
            Maximum of {maxSelections} comparison seasons selected.
          </p>
        )}
        <CommandList>
          <div className="p-2.5 text-xs gap-1.5 flex items-start text-muted-foreground">
            <Info className="size-4" />
            <p>Seasons with no data are not included in the options.</p>
          </div>
          <CommandEmpty>No season found.</CommandEmpty>
          <CommandGroup>
            <div className={cn("grid gap-2", seasonOptions.length > 4 ? "grid-cols-2" : "grid-cols-1")}>
              {seasonOptions.map((opt) => {
                const isSelected = values.includes(Number(opt.value));
                const isDisabled = !isSelected && atMax;
                return (
                  <CommandItem
                    key={opt.value}
                    value={opt.value}
                    onSelect={() => handleToggle(opt.value)}
                    disabled={isDisabled}
                    className={cn(
                      "flex items-center justify-between cursor-pointer rounded-sm text-2xs",
                      isDisabled && "opacity-40 cursor-not-allowed"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={isSelected}
                        disabled={isDisabled}
                        className="size-5"
                      />
                      <span className="truncate">{opt.label}</span>
                    </div>
                    {isSelected && (
                      <span className="text-xs text-blue-600 bg-blue-100 px-1.5 py-0.5 rounded shrink-0">
                        Selected
                      </span>
                    )}
                  </CommandItem>
                );
              })}
            </div>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
});
