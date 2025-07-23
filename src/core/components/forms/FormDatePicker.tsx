import { FormField, FormItem } from "@/core/components/ui/form";
import { useFormContext } from "react-hook-form";
import { FormLabel } from "./FormLabel";
import { DatePicker } from "../DatePicker";
import { FormFieldError } from "./FormFieldError";

interface FormDatePickerProps {
  label: string;
  name: string;
}

export const FormDatePicker = ({ name, label }: FormDatePickerProps) => {
  const form = useFormContext();

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
              date.setHours(12, 0, 0, 0)
              return field.onChange(date?.toISOString().split("T")[0])
            }}
          />
          <FormFieldError />
        </FormItem>
      )}
    />
  );
};
