import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
 
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Control, Controller } from "react-hook-form"
import { useState } from "react"

interface DatePickerProps {
  control: Control<any>;
  name: string;
}

export function DatePicker({ control, name }: DatePickerProps) {
  const [open, setOpen] = useState(false)

  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              data-empty={!field.value}
              className="data-[empty=true]:text-muted-foreground w-[280px] justify-start text-left font-normal"
            >
              <CalendarIcon className="size-4 text-muted-foreground/60 mr-2" />
              <span className="text-xs text-muted-foreground/60">
                {field.value ? (
                  format(field.value, "PPP")
                ) : (
                  "Pick a date"
                )}
              </span>

            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={field.value}
              onSelect={(date) => {
                field.onChange(format(date!, "yyyy-MM-dd"))
                setOpen(false) 
              }}
            />
          </PopoverContent>
        </Popover>
      )}
    />
  )
}