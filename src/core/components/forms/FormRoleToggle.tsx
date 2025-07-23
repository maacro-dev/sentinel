import { FormField, FormItem, FormControl } from "@/core/components/ui/form";
import { memo } from "react";
import { FieldValues, Path, useFormContext } from "react-hook-form";
import { FormFieldError } from "./FormFieldError";
import { FormLabel } from "./FormLabel";
import { RoleToggleGroup } from "@/features/users/components/RoleToggleGroup";

interface FormRoleToggleProps<T extends FieldValues> {
  name: Path<T>;
  label: string;
  options?: {
    data_collector?: boolean;
    data_manager?: boolean;
  };
};

export const FormRoleToggle = memo(<T extends FieldValues>({
  name,
  label,
  options,
}: FormRoleToggleProps<T>) => {

  const { control } = useFormContext<T>();

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={"group flex flex-col gap-2 flex-1"}>
          <FormLabel name={name} label={label}  />
          <FormControl>
            <RoleToggleGroup options={options} {...field} />
          </FormControl>
          <FormFieldError />
        </FormItem>
      )}
    />
  );
});
