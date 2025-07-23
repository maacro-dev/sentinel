
import { FormLabel as SFormLabel } from "@/core/components/ui/form"

interface FormLabelProps {
  name: string
  label: string
}

export function FormLabel({ name, label }: FormLabelProps) {
  return (
    <SFormLabel
      htmlFor={name}
      className="text-xs font-normal text-muted-foreground
      group-focus-within:text-primary group-focus-within:font-medium
      transition-colors"
    >
      {label}
    </SFormLabel>
  )
}
