import { Dispatch, SetStateAction, memo } from "react";
import { TimeRange } from "../types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/core/components/ui/select";

const defaultTimeRangeOptions: Array<{ value: TimeRange; label: string }> = [
  { value: "season",  label: "Current Season" },
  { value: "7d",      label: "Last 7 days" },
  { value: "30d",     label: "Last 30 days" },
  { value: "90d",     label: "Last 90 days" },
];

interface TimeRangeSelectorProps {
  timeRange: TimeRange;
  setTimeRange: Dispatch<SetStateAction<TimeRange>>;
}

export const TimeRangeSelector = memo(({
  timeRange,
  setTimeRange,
}: TimeRangeSelectorProps) => {
  return (
    <Select value={timeRange} onValueChange={(value: TimeRange) => setTimeRange(value)}>
      <SelectTrigger className="shadow-none min-w-[160px] rounded-sm text-[0.7rem] text-primary/90">
        <SelectValue placeholder="Full season" />
      </SelectTrigger>
      <SelectContent className="rounded-xl">
        {defaultTimeRangeOptions.map((option) => (
          <SelectItem key={option.value} value={option.value} className="rounded-lg text-xs">
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
})
