import { memo, useState } from "react";
import { useNavigate, useRouter } from "@tanstack/react-router";
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
import { useCurrentSeason, useCurrentSeasonId, useSeasonsForSelector } from "@/features/fields/hooks/useSeasons";
import { formatSeasonLabel } from "@/features/fields/util";
import { useImportNotificationStore } from "@/features/import/store/useImportNotificationStore";
import { cn } from "@/core/utils/style";

export const SeasonSelector = memo(() => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const { selected: selectedSeason, label: displayLabel, isLoading: loadingCurrent } = useCurrentSeason();
  const { options: seasonOptions, isLoading: loadingOptions } = useSeasonsForSelector();
  const { data: currentSeasonId } = useCurrentSeasonId();
  const { clearSeasonDot, showSeasonDot, importedSeasonId } = useImportNotificationStore();
  const router = useRouter()

  const handleSeasonChange = (value: string) => {
    clearSeasonDot();
    navigate({ to: ".", search: () => ({ seasonId: Number(value) }) });
    setOpen(false);
  };


  const isSelected = (value: string) => selectedSeason?.id === Number(value);

  return (
    <div className="flex items-center gap-4">
      <span className="flex items-center text-xs lt:text-3xs dt:text-2xs hd:text-xs text-primary font-medium">
        {displayLabel}
      </span>
      <Button
        variant="outline"
        className="shadow-none min-w-35 rounded-sm lt:h-8! dt:h-9! text-3xs lt:text-5xs dt:text-4xs hd:text-3xs text-primary/90 justify-start gap-2 relative"
        onClick={() => setOpen(true)}
        disabled={loadingCurrent || loadingOptions}
      >
        <Calendar className="size-3 shrink-0" />
        <span className="truncate">
          {selectedSeason ? formatSeasonLabel(selectedSeason) : "Select season"}
        </span>
        {showSeasonDot && importedSeasonId !== currentSeasonId && (
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
          </span>
        )}
      </Button>

      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        className="w-lg max-w-full"
      >
        <CommandInput placeholder="Search seasons..." />
        <CommandList>
          <CommandEmpty>No season found.</CommandEmpty>
          <CommandGroup>
            <div className={cn(`grid gap-2`, seasonOptions.length > 4 ? "grid-cols-2" : "grid-cols-1")
            }>
              {seasonOptions.map((option) => {
                const isCurrent = currentSeasonId === Number(option.value);
                const isNew = importedSeasonId === Number(option.value);
                const selected = isSelected(option.value);
                return (
                  <CommandItem
                    key={option.value}
                    value={option.value}
                    onSelect={(currentValue) => handleSeasonChange(currentValue)}
                    className="flex items-center justify-between cursor-pointer rounded-sm text-2xs"
                    onMouseEnter={() => {
                      const newSeasonId = Number(option.value);
                      router.preloadRoute({ to: ".", search: { seasonId: newSeasonId } });
                    }}
                  >
                    <span className="truncate">{option.label}</span>
                    <div className="flex gap-2 shrink-0">
                      {selected && (
                        <span className="text-xs text-blue-600 bg-blue-100 px-1.5 py-0.5 rounded">
                          Selected
                        </span>
                      )}
                      {isNew && (
                        <span className="text-xs text-green-600 bg-green-100 px-1.5 py-0.5 rounded">
                          New
                        </span>
                      )}
                      {isCurrent && (
                        <span className="text-xs text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                          Current
                        </span>
                      )}
                    </div>
                  </CommandItem>
                );
              })}
            </div>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </div>
  );
});
