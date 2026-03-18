import { memo, useMemo } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/core/components/ui/select";
import { Calendar } from "lucide-react";
import { useCurrentSeason, useSeasonOptions } from "@/features/fields/hooks/useSeasons";

export const SeasonSelector = memo(() => {
  const navigate = useNavigate();

  const { selected: selectedSeason, label: displayLabel, isLoading } = useCurrentSeason()
  const { options: seasonOptions} = useSeasonOptions()

  const handleSeasonChange = (value: string) => {
    navigate({ to: ".", search: () => ({ seasonId: Number(value) }) });
  };

  return (
    <div className="flex items-center gap-4">
      <span className="flex items-center text-xs lt:text-3xs dt:text-2xs hd:text-xs text-primary font-medium">
        {displayLabel}
      </span>
      <Select
        value={selectedSeason ? String(selectedSeason.id) : undefined}
        onValueChange={handleSeasonChange}
        disabled={isLoading}
      >
        <SelectTrigger className="hadow-none min-w-35 rounded-sm lt:h-8! dt:h-9! text-3xs lt:text-5xs dt:text-4xs hd:text-3xs text-primary/90">
          <Calendar className="size-3" />
          <SelectValue placeholder="Select season" />
        </SelectTrigger>
        <SelectContent position="popper" className="rounded-xl max-h-80">
          <SelectGroup>
            <SelectLabel>Seasons</SelectLabel>
            {seasonOptions.map((option) => (
              <SelectItem
                key={option.value}
                value={option.value}
                className="rounded-lg text-3xs lt:text-2xs hd:text-xs"
              >
                {option.label}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
});
