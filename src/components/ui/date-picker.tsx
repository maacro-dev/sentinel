import { Calendar as CalendarIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { formatDate } from "@/utils/date/format";
import { cn } from "@/lib/utils";

interface DatePickerProps {
  selected: string;
  onSelect: (date: string) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
}

export function DatePicker({ selected, onSelect, open, setOpen }: DatePickerProps) {
  
  const handleSelect = (date: Date | undefined) => {
    onSelect(date!.toISOString().slice(0, 10))
    setOpen(false)
  }

  return (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              data-empty={!selected}
              className={cn(
                "flex items-center gap-2",
                "shadow-none border-input border rounded-md data-[empty=true]:text-muted-foreground w-full h-8 justify-start text-left font-normal", 
                "ring-0 ring-transparent ring-offset-2 ring-offset-background", 
              )}
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
              selected={new Date(selected)}
              onSelect={handleSelect}
            />
          </PopoverContent>
        </Popover>
  );
}