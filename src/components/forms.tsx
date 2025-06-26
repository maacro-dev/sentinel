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
import { ReactNode, memo, useMemo } from "react";
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

type TextFieldTypes = "text" | "password" | "email";

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
};

const InternalTextField = <T extends FieldValues>({
  label,
  name,
  placeholder,
  type = "text",
}: HumayTextFieldProps<T>) => {
  const form = useFormContext<T>();

  return (
    <div className="space-y-2">
      <FormLabel>{label}</FormLabel>
      <FormField
        control={form.control}
        name={name}
        render={({ field }) => (
          <>
            <FormControl>
              <Input id={name} type={type} placeholder={placeholder} {...field} />
            </FormControl>
            <FormMessage />
          </>
        )}
      />
    </div>
  );
};

const HumayTextField = memo(InternalTextField);

interface InternalSelectProps<T extends FieldValues> {
  className?: string;
  name: Path<T>;
  label?: string;
  placeholder?: string;
  data: Array<{ value: string; label: string }>;
}

const InternalSelect = <T extends FieldValues>({
  className,
  name,
  label,
  placeholder,
  data,
}: InternalSelectProps<T>) => {
  const form = useFormContext<T>();

  return (
    <div className="space-y-2">
      <FormLabel>{label}</FormLabel>
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
                <SelectTrigger className={cn("w-full", className)}>
                  <SelectValue placeholder={placeholder} />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Roles</SelectLabel>
                    {data.map(({ value, label }) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </FormControl>
            <FormMessage />
          </>
        )}
      />
    </div>
  );
};

const HumayRoleSelect = <T extends FieldValues>(
  props: Omit<InternalSelectProps<T>, "data">
) => {
  const data = useMemo(
    () => [
      { value: "1", label: "Admin" },
      { value: "3", label: "Data Manager" },
      { value: "2", label: "Data Collector" },
    ],
    []
  );

  return <InternalSelect {...props} data={data} />;
};

export { HumayForm, HumayTextField, HumayRoleSelect };
