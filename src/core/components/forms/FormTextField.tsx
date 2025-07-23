import { ComponentProps, memo } from "react";
import { cn } from "@/core/utils/style";
import { Input } from "@/core/components/ui/input";
import { type FieldValues, type Path, useFormContext } from "react-hook-form";
import {
  FormField,
  FormItem,
  FormControl,
} from "@/core/components/ui/form";
import { FormLabel } from "./FormLabel";
import { FormFieldError } from "./FormFieldError";

interface FormTextFieldProps<T extends FieldValues>
  extends Omit<ComponentProps<typeof Input>, "name">{
    label: string;
    name: Path<T>;
    containerClassName?: string;
};

export const FormTextField = memo(<T extends FieldValues>({
  name,
  label,
  containerClassName,
  className,
  ...props
}: FormTextFieldProps<T>) => {

  const { control } = useFormContext<T>();

  return (
    <FormField
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <FormItem className={cn(
          "group flex flex-col gap-2", containerClassName
          )}>
          <FormLabel name={name} label={label}  />
          <FormControl>
            <Input
              id={field.name}
              containerClassName="h-8"
              data-error={!!fieldState.error}
              type="text"
              className={cn("text-xs", className)}
              {...props}
              {...field}
            />
          </FormControl>
          <FormFieldError />
        </FormItem>
      )}
    />
  );
});
