import { memo, useState, useMemo } from "react";
import { Calendar } from "lucide-react";
import { Button } from "@/core/components/ui/button";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/core/components/ui/command";
import { cn } from "@/core/utils/style";
import { useCurrentSeason, useSeasonsForSelector } from "@/features/fields/hooks/useSeasons";

interface SeasonPickerProps {
  values?: number[];
  onChange: (seasonIds: number[]) => void;
  disabled?: boolean;
}

export const SeasonPicker = memo(({ values = [], onChange, disabled }: SeasonPickerProps) => {
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
      onChange([...values, id]);
    }
  };


  const isLoading = loadingOptions || loadingCurrent;

  const triggerLabel = selectedSeasons.length === 0
    ? "Compare seasons…"
    : `${selectedSeasons.length} season${selectedSeasons.length > 1 ? "s" : ""} selected`;

  return (
    <>
      <div className="flex flex-col gap-1.5">
        <Button
          variant="outline"
          className="shadow-none min-w-45 py-2! rounded-sm h-9 text-3xs lt:text-5xs dt:text-4xs hd:text-3xs text-primary/90 justify-start gap-2"
          onClick={() => setOpen(true)}
          disabled={disabled || isLoading}
        >
          <Calendar className="size-3 shrink-0" />
          <span className="truncate">{triggerLabel}</span>
        </Button>
      </div>
      <CommandDialog open={open} onOpenChange={setOpen} className="w-lg max-w-full">
        <CommandInput placeholder="Search seasons..." />
        <CommandList>
          <CommandEmpty>No season found.</CommandEmpty>
          <CommandGroup>
            <div className={cn("grid gap-2", seasonOptions.length > 4 ? "grid-cols-2" : "grid-cols-1")}>
              {seasonOptions.map((opt) => {
                const isSelected = values.includes(Number(opt.value));
                return (
                  <CommandItem
                    key={opt.value}
                    value={opt.value}
                    onSelect={() => handleToggle(opt.value)}
                    className="flex items-center justify-between cursor-pointer rounded-sm text-2xs"
                  >
                    <div className="flex items-center gap-2">
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
