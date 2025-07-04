/**
 * Humay Forms
 * ---
 * Wrapper around `shadcn/ui` forms and `react-hook-form`.
 */

import {
  Form,
  FormControl,
  FormField,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { UseFormReturn, FieldValues, Path, useFormContext } from "react-hook-form";
import { ReactNode, memo, useMemo, useState } from "react";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { DatePicker } from "./ui/date-picker";

type TextFieldTypes = "text" | "password" | "email";

const errorMessage = "text-xs text-red-500 font-normal opacity-80"

type HumayFormProps<T extends FieldValues> = {
  form: UseFormReturn<T>;
  onSubmit: (values: T) => void;
  children: ReactNode;
};

const HumayForm = <T extends FieldValues>({
  form,
  onSubmit,
  children,
}: HumayFormProps<T>) => {
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 ">
        {children}
      </form>
    </Form>
  );
};

type HumayTextFieldProps<T extends FieldValues> = {
  label: string;
  name: Path<T>;
  placeholder?: string;
  type?: TextFieldTypes;
  className?: string;
  disabled?: boolean;
  note?: string;
};

const HumayTextField = memo(<T extends FieldValues>({
  label,
  name,
  placeholder,
  type = "text",
  className,
  disabled,
  note,
}: HumayTextFieldProps<T>) => {

  const form = useFormContext<T>();

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <div className="space-y-1.5">
          <FormControl>
            <div className="group flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <FormLabel
                  htmlFor={name}
                  className="text-xs font-normal text-muted-foreground group-focus-within:text-primary group-focus-within:font-medium transition-colors"
                >
                  {label}
                </FormLabel>
                {note && (
                  <p className="text-[0.45rem] tracking-loose uppercase text-muted-foreground/60">{note}</p>
                )}
              </div>
              <Input
                id={name}
                type={type}
                placeholder={placeholder}
                {...field}
                className={cn("md:text-xs", className)}
                disabled={disabled}
              />
            </div>
          </FormControl>
          <FormMessage className={errorMessage} />
        </div>
      )}
    />
  );
});

interface HumaySelectProps<T extends FieldValues> {
  className?: string;
  name: Path<T>;
  label?: string;
  placeholder?: string;
  data: Array<{ value: string; label: string }>;
}

const HumaySelect = memo(<T extends FieldValues>({
  className,
  name,
  label,
  placeholder,
  data,
}: HumaySelectProps<T>) => {
  const form = useFormContext<T>();

  return (
    <div className="space-y-1.5">
      <FormLabel
        htmlFor={name}
        className="text-xs font-normal text-muted-foreground group-focus-within:text-primary group-focus-within:font-medium transition-colors"
      >
        {label}
      </FormLabel>

      <FormField
        control={form.control}
        name={name}
        render={({ field }) => (
          <>
            <FormControl>
              <Select
                value={field.value}
                onValueChange={field.onChange}
                name={field.name}
              >
                <SelectTrigger className={cn("w-full text-xs", className)}>
                  <SelectValue className="text-base" placeholder={placeholder} />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Roles</SelectLabel>
                    {data.map(({ value, label }) => (
                      <SelectItem key={value} value={value} className="text-xs">
                        {label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </FormControl>
            <FormMessage className={errorMessage} />
          </>
        )}
      />
    </div>
  );
});

const HumayRoleSelect = <T extends FieldValues>(
  props: Omit<HumaySelectProps<T>, "data">
) => {
  const data = useMemo(
    () => [
      { value: "admin", label: "Admin" },
      { value: "data_manager", label: "Data Manager" },
      { value: "data_collector", label: "Data Collector" },
    ],
    []
  );

  return <HumaySelect {...props} data={data} />;
};

interface HumayDatePickerProps {
  label: string;
  name: string;
  placeholder?: string;
}

const HumayDatePicker = ({ name, label }: HumayDatePickerProps) => {
  const form = useFormContext();
  const [open, setOpen] = useState(false)

  return (
    <div className="space-y-1.5">
      <FormLabel
        htmlFor={name}
        className="text-xs font-normal text-muted-foreground group-focus-within:text-primary group-focus-within:font-medium transition-colors"
      >
        {label}
      </FormLabel>
      <FormField
        control={form.control}
        name={name}
        render={({ field }) => (
          <>
          <FormControl>
            <DatePicker 
              selected={field.value} 
              onSelect={field.onChange} 
              open={open} 
              setOpen={setOpen} 
            />
          </FormControl>
          <FormMessage className={errorMessage} />
          </>
        )}
      />
    </div>
  );
};

export { HumayForm, HumayTextField, HumayRoleSelect, HumayDatePicker };
