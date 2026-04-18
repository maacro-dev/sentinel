import { FormField, FormItem } from "@/core/components/ui/form";
import { useFormContext } from "react-hook-form";
import { FormLabel } from "./FormLabel";
import { DatePicker } from "../DatePicker";
import { FormFieldError } from "./FormFieldError";
import React from "react";

interface FormDatePickerProps {
  label: string;
  name: string;
  minDate?: Date;
  maxDate?: Date;
  initialValue?: string;
}

export const FormDatePicker = ({ name, label, minDate, maxDate, initialValue }: FormDatePickerProps) => {
  const form = useFormContext();
  const initialSet = React.useRef(false);

  React.useEffect(() => {
    if (initialValue && !initialSet.current && !form.getValues(name)) {
      form.setValue(name, initialValue);
      initialSet.current = true;
    }
  }, [initialValue, name, form]);

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className="group flex flex-col gap-2 flex-1">
          <FormLabel name={name} label={label} />
          <DatePicker
            value={field.value}
            onSelect={(date) => {
              date.setHours(12, 0, 0, 0);
              field.onChange(date?.toISOString().split("T")[0]);
            }}
            minDate={minDate}
            maxDate={maxDate}
          />
          <FormFieldError />
        </FormItem>
      )}
    />
  );
};
