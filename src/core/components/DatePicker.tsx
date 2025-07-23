import { Button } from "@/core/components/ui/button";
import { FormControl } from "@/core/components/ui/form";
import { Popover, PopoverTrigger, PopoverContent } from "@/core/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/core/components/ui/calendar";
import { formatDate } from "../utils/date";
import { cn } from "../utils/style";

interface DatePickerProps {
  value: Date,
  onSelect: (date: Date) => void
}

export function DatePicker({ value, onSelect }: DatePickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <FormControl>
          <Button
            variant={"outline"}
            className={cn(
              "h-8 text-left font-normal text-xs",
              !value && "text-muted-foreground"
            )}
          >
            {value ? formatDate(value) : <span>Pick a date</span>}
            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
          </Button>
        </FormControl>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          required
          mode="single"
          selected={value}
          onSelect={onSelect}
          disabled={(date: Date) =>
            date > new Date() || date < new Date("1900-01-01")
          }
          captionLayout="dropdown"
        />
      </PopoverContent>
    </Popover>
  )
}
