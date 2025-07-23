import { ReactNode } from "react";
import {
  FieldValues,
  UseFormReturn,
} from "react-hook-form";
import {
  FormProvider
} from "@/core/components/ui/form";

interface FormProps<T extends FieldValues> {
  form: UseFormReturn<T>
  onSubmit: (values: T) => void
  children: ReactNode
};

export function Form<T extends FieldValues>({
  form,
  onSubmit,
  children,
}: FormProps<T>) {
  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {children}
      </form>
    </FormProvider>
  )
}
