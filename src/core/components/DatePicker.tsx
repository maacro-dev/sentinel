import * as React from "react";
import { Button } from "@/core/components/ui/button";
import { FormControl } from "@/core/components/ui/form";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/core/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/core/components/ui/calendar";
import { formatDate } from "../utils/date";
import { cn } from "../utils/style";

interface DatePickerProps {
  value: Date | string;
  onSelect: (date: Date) => void;
  minDate?: Date;
  maxDate?: Date;
}

export function DatePicker({ value, onSelect, minDate, maxDate }: DatePickerProps) {
  const [open, setOpen] = React.useState(false);

  const dateValue = React.useMemo(() => {
    if (typeof value === "string") return value ? new Date(value) : undefined;
    return value;
  }, [value]);

  const defaultMonth = dateValue ?? minDate ?? maxDate ?? new Date();
  const [displayMonth, setDisplayMonth] = React.useState(defaultMonth);

  React.useEffect(() => {
    if (open) {
      const newMonth = dateValue ?? minDate ?? maxDate ?? new Date();
      setDisplayMonth(newMonth);
    }
  }, [open, dateValue?.getTime(), minDate?.getTime(), maxDate?.getTime()]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <FormControl>
          <Button
            variant="outline"
            className={cn(
              "h-8 text-left font-normal text-xs",
              !dateValue && "text-muted-foreground"
            )}
          >
            {dateValue ? formatDate(dateValue) : <span>Pick a date</span>}
            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
          </Button>
        </FormControl>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          required
          mode="single"
          selected={dateValue}
          month={displayMonth}
          onMonthChange={setDisplayMonth}
          onSelect={(date) => {
            if (!date) return;
            onSelect(date);
            setOpen(false);
          }}
          disabled={(date: Date) => {
            if (minDate && date < minDate) return true;
            if (maxDate && date > maxDate) return true;
            return false;
          }}
          captionLayout="dropdown"
        />
      </PopoverContent>
    </Popover>
  );
}
