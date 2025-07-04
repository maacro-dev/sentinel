import { Calendar as CalendarIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { formatDate } from "@/lib/utils";

interface DatePickerProps {
  selected: Date;
  onSelect: (date: Date) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
}

export function DatePicker({ selected, onSelect, open, setOpen }: DatePickerProps) {
  
  const handleSelect = (date: Date | undefined) => {
    onSelect(date!)
    setOpen(false)
  }

  return (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              data-empty={!selected}
              className="data-[empty=true]:text-muted-foreground w-[280px] justify-start text-left font-normal"
            >
              <CalendarIcon className="size-4 text-muted-foreground/60" />
                {selected ? (
                  <span className="text-xs text-primary">
                    {formatDate(selected)}
                  </span>
                ) : (
                  <span className="text-xs text-muted-foreground/60">
                    Pick a date
                  </span>
                )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={selected}
              onSelect={handleSelect}
            />
          </PopoverContent>
        </Popover>
  );
}