import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/core/components/ui/dialog"
import { Button } from "@/core/components/ui/button"
import { Plus } from "lucide-react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import { MfidFormInput, mfidFormInputSchema } from "../schemas/mfid-create.schema"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue
} from "@/core/components/ui/select"
import { Field, FieldLabel, FieldError, FieldGroup } from "@/core/components/ui/field"
import { useLguHierarchy } from "../hooks/useLgu"


interface MfidFormDialogProps {
  onSubmit: (input: MfidFormInput) => void
  disabled?: boolean
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function MfidFormDialog({
  onSubmit,
  disabled,
  open,
  onOpenChange
}: MfidFormDialogProps) {
  const form = useForm<MfidFormInput>({
    resolver: zodResolver(mfidFormInputSchema),
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: {
      province: "",
      city_municipality: "",
      // barangay: ""
    },
  });

  const {
    provinces,
    cities,
    // barangays,
    isLoadingProvinces,
    isLoadingMunicities,
    // isLoadingBarangays,
  } = useLguHierarchy(form);

  const handleSubmit = (input: MfidFormInput) => {
    onSubmit(input);
    form.reset();
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) form.reset();
    onOpenChange(isOpen);
  };

  const handleCancel = () => {
    form.reset();
    onOpenChange(false);
  };


  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="default" disabled={disabled} className="min-w-32 text-xs">
          <Plus /> Create MFID
        </Button>
      </DialogTrigger>

      <DialogContent className="w-96 max-w-sm">
        <form id="mfid-create-form" onSubmit={form.handleSubmit(handleSubmit)}>
          <DialogHeader className="mb-6 pb-4 border-b">
            <DialogTitle>Create MFID</DialogTitle>
            <DialogDescription> Enter the details to create a new MFID.  </DialogDescription>
          </DialogHeader>

          <FieldGroup>
            <FormSelect
              form={form}
              name="province"
              label="Province"
              placeholder="Select a province"
              options={provinces.map((p) => p.name)}
              isLoading={isLoadingProvinces}
            />

            <FormSelect
              form={form}
              name="city_municipality"
              label="City / Municipality"
              placeholder="Select a city/municipality"
              options={cities.map((c) => c.name)}
              disabled={!form.watch("province")}
              isLoading={isLoadingMunicities}
            />
          </FieldGroup>

          <DialogFooter className="border-t mt-6 pt-4 flex justify-between">
            <Field>
              <Button className="w-full" type="submit">
                Create MFID
              </Button>
              <Button
                className="w-full"
                type="button"
                variant="outline"
                onClick={handleCancel}
              >
                Cancel
              </Button>
            </Field>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}


interface FormSelectProps {
  form: any
  name: string
  label: string
  placeholder: string
  options: Array<string>,
  disabled?: boolean,
  isLoading?: boolean
}

function FormSelect({ form, name, label, placeholder, options, disabled = false, isLoading }: FormSelectProps) {
  return (
    <Controller
      name={name}
      control={form.control}
      render={({ field, fieldState }) => (
        <Field orientation="vertical" data-invalid={fieldState.invalid}>
          <FieldLabel htmlFor={`mfid-create-${name}`}>{label}</FieldLabel>
          <Select
            name={field.name}
            value={field.value}
            onValueChange={field.onChange}
            disabled={disabled || isLoading}
          >
            <SelectTrigger
              aria-invalid={fieldState.invalid}
              id={`mfid-create-${name}`}
              disabled={disabled || isLoading}
            >
              <SelectValue
                placeholder={isLoading ? "Loading..." : placeholder}
              />
            </SelectTrigger>
            <SelectContent position="popper">
              <SelectGroup>
                <SelectLabel>{label}</SelectLabel>
                {options.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  )
}
