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
import { useCurrentSeason, useSeasonsForSelector } from "@/features/fields/hooks/useSeasons";
import { cn } from "@/core/utils/style";

interface SeasonPickerProps {
  value?: number;
  onChange: (seasonId: number) => void;
  disabled?: boolean;
}

export const SeasonPicker = memo(({ value, onChange, disabled }: SeasonPickerProps) => {
  const [open, setOpen] = useState(false);
  const { options: seasonOptionsData, isLoading: loadingOptions } = useSeasonsForSelector();
  const { selected: currentSeason, isLoading: loadingCurrent } = useCurrentSeason();

  const seasonOptions = useMemo(() => {
    if (!seasonOptionsData || !currentSeason) return [];
    if (currentSeason.id !== undefined && currentSeason.id !== null) {
      return seasonOptionsData.filter(opt => Number(opt.value) !== Number(currentSeason.id));
    }
    return seasonOptionsData;
  }, [seasonOptionsData, currentSeason]);

  const selectedSeason = value ? seasonOptionsData?.find(opt => Number(opt.value) === value) : null;
  const displayLabel = selectedSeason ? selectedSeason.label : "Select season";

  const handleSelect = (val: string) => {
    onChange(Number(val));
    setOpen(false);
  };

  const isLoading = loadingOptions || loadingCurrent;

  return (
    <>
      <Button
        variant="outline"
        className="shadow-none min-w-45 py-2! rounded-sm h-9 text-3xs lt:text-5xs dt:text-4xs hd:text-3xs text-primary/90 justify-start gap-2"
        onClick={() => setOpen(true)}
        disabled={disabled || isLoading}
      >
        <Calendar className="size-3 shrink-0" />
        <span className="truncate">{displayLabel}</span>
      </Button>

      <CommandDialog open={open} onOpenChange={setOpen} className="w-lg max-w-full">
        <CommandInput placeholder="Search seasons..." />
        <CommandList>
          <CommandEmpty>No season found.</CommandEmpty>
          <CommandGroup>
            <div className={cn("grid gap-2", seasonOptions.length > 4 ? "grid-cols-2" : "grid-cols-1")}>
              {seasonOptions.map((opt) => {
                const isSelected = value === Number(opt.value);
                return (
                  <CommandItem
                    key={opt.value}
                    value={opt.value}
                    onSelect={handleSelect}
                    className="flex items-center justify-between cursor-pointer rounded-sm text-2xs"
                  >
                    <span className="truncate">{opt.label}</span>
                    {isSelected && (
                      <span className="text-xs text-blue-600 bg-blue-100 px-1.5 py-0.5 rounded">
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
