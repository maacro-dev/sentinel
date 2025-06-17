/**
 * Humay Forms
 * ---
 * Wrapper around `shadcn/ui` forms and `react-hook-form`.
 */

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  UseFormReturn,
  FieldValues,
  Path,
  useFormContext,
} from "react-hook-form";
import { ReactNode } from "react";
import { Input } from "./ui/input";

type TextFieldTypes = "text" | "password";

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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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

const HumayTextField = <T extends FieldValues>({
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
            <FormItem>
              <FormControl>
                <Input
                  type={type}
                  placeholder={placeholder ? placeholder : ""}
                  {...field}
                />
              </FormControl>
            </FormItem>
            <FormMessage />
          </>
        )}
      />
    </div>
  );
};

export { HumayForm, HumayTextField };
