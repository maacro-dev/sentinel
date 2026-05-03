import { useFormContext } from "react-hook-form";
import { FormLabel } from "./FormLabel";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { FormField, FormItem, FormControl } from "../ui/form";
import { FieldError, FormFieldError } from "./FormFieldError";
import { Label } from "../ui/label";
import { cn } from "@/core/utils/style";

interface Option {
  label: string;
  value: string;
  disabled?: boolean;
}

interface FormSelectProps {
  name: string;
  label: string;
  options: Option[];
  placeholder?: string;
  disabled?: boolean;
}

export const FormSelect = ({
  name,
  label,
  options,
  placeholder = "Select option",
  disabled = false,
}: FormSelectProps) => {
  const form = useFormContext();

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem className="flex flex-col gap-2 flex-1">
          <FormLabel name={name} label={label} />

          <Select
            onValueChange={field.onChange}
            value={field.value}
            disabled={disabled}
          >
            <FormControl>
              <SelectTrigger className="w-full text-xs">
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
            </FormControl>

            <SelectContent position="popper">
              {options.length > 0 ? (
                options.map((opt, i) => (
                  <SelectItem
                    key={`${opt.value}-${i}`}
                    value={opt.value}
                    disabled={opt.disabled}
                    className="text-xs"
                  >
                    {opt.label}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="no-options" disabled>
                  No options available
                </SelectItem>
              )}
            </SelectContent>
          </Select>

          <FormFieldError />
        </FormItem>
      )}
    />
  );
};



interface SelectProps {
  name: string;
  label: string;
  options: Option[];
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  triggerClass?: string;
  error?: string;
}

export const SentinelSelect = ({
  name,
  label,
  options,
  value,
  onChange,
  placeholder = "Select option",
  triggerClass,
  disabled = false,
  error,
}: SelectProps) => {
  console.log({ Select, SelectTrigger, SelectContent, SelectItem });

  return (
    <div className="flex flex-col gap-2">
      <Label id={name} className="text-xs font-normal text-muted-foreground group-focus-within:text-primary group-focus-within:font-medium transition-colors" >
        {label}
      </Label>

      <Select
        onValueChange={onChange}
        value={value}
        disabled={disabled}
      >
        <SelectTrigger className={cn("w-full text-xs", triggerClass)}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>

        <SelectContent position="popper" className="max-h-96">
          {options.length > 0 ? (
            options.map((opt, i) => (
              <SelectItem
                key={`${opt.value}-${i}`}
                value={opt.value}
                disabled={opt.disabled}
                className="text-xs"
              >
                {opt.label}
              </SelectItem>
            ))
          ) : (
            <SelectItem value="no-options" disabled>
              No options available
            </SelectItem>
          )}
        </SelectContent>
      </Select>

      {error && <FieldError message={error} />}
    </div>
  );
};
