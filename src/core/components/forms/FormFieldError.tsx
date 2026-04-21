import { FormMessage } from "@/core/components/ui/form";

export function FormFieldError() {
  return <FormMessage className="text-[0.675rem] text-error font-light mt-1" />
}



export function FieldError({ message }: { message: string }) {
  return <p className="text-[0.675rem] text-error font-light mt-1">
    {message}
  </p>
}
