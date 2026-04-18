import { useState } from "react"
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
import * as z from "zod/v4"
import { useForm } from "react-hook-form"
import { FieldGroup } from "@/core/components/ui/field"
import { useLguHierarchy } from "../hooks/useLgu"
import { Form, FormDatePicker, FormTextField } from "@/core/components/forms"
import { cn } from "@/core/utils/style"
import { FormSelect } from "@/core/components/forms/FormSelect"
import { calculateAge, getDateYearsAgo } from "@/core/utils/date"

function isValidPhilippineMobile(phone: string): boolean {
  const cleaned = phone.replace(/\D/g, ''); // remove non-digits
  return /^09\d{9}$/.test(cleaned); // starts with 09 and exactly 11 digits
}

const mfidFormSchema = z.object({
  mfid_type: z.enum(["open", "assigned"]),
  province: z.string().min(1, "Province is required"),
  city_municipality: z.string().min(1, "City / Municipality is required"),
  barangay: z.string().min(1, "Barangay is required"),
  farmer_first_name: z.string().optional(),
  farmer_last_name: z.string().optional(),
  farmer_gender: z.enum(["male", "female", "other"]).optional(),
  farmer_date_of_birth: z.string().optional(),
  farmer_cellphone_no: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.mfid_type === "assigned") {
    if (!data.farmer_first_name?.trim()) {
      ctx.addIssue({ code: "custom", message: "First name is required", path: ["farmer_first_name"] })
    }
    if (!data.farmer_last_name?.trim()) {
      ctx.addIssue({ code: "custom", message: "Last name is required", path: ["farmer_last_name"] })
    }
    if (!data.farmer_date_of_birth?.trim()) {
      ctx.addIssue({ code: "custom", message: "Date of birth is required", path: ["farmer_date_of_birth"] })
    } else {
      const age = calculateAge(data.farmer_date_of_birth)
      if (age < 16) {
        ctx.addIssue({ code: "custom", message: "Farmer must be at least 16 years old", path: ["farmer_date_of_birth"] })
      } else if (age > 80) {
        ctx.addIssue({ code: "custom", message: "Farmer must be at most 80 years old", path: ["farmer_date_of_birth"] })
      }
    }
    if (!data.farmer_cellphone_no?.trim()) {
      ctx.addIssue({ code: "custom", message: "Cellphone number is required", path: ["farmer_cellphone_no"] });
    } else if (!isValidPhilippineMobile(data.farmer_cellphone_no)) {
      ctx.addIssue({ code: "custom", message: "Invalid cellphone number (must be 11 digits starting with 09, e.g., 09171234567)", path: ["farmer_cellphone_no"] });
    }
  }
})


export type MfidFormInput = z.infer<typeof mfidFormSchema>
export type MfidFormPayload = Omit<MfidFormInput, "mfid_type">

interface MfidFormDialogProps {
  onSubmit: (payload: MfidFormPayload) => void
  disabled?: boolean
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function MfidFormDialog({
  onSubmit,
  disabled,
  open,
  onOpenChange,
}: MfidFormDialogProps) {
  const minDateOfBirth = getDateYearsAgo(16)

  const [step, setStep] = useState<1 | 2>(1)

  const form = useForm<MfidFormInput>({
    resolver: zodResolver(mfidFormSchema),
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: {
      mfid_type: undefined,
      province: "",
      city_municipality: "",
      barangay: "",
      farmer_first_name: "",
      farmer_last_name: "",
      farmer_gender: "male",
      farmer_date_of_birth: minDateOfBirth,
      farmer_cellphone_no: "",
    },
  })

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const maxDate = new Date(today);
  maxDate.setFullYear(today.getFullYear() - 16);
  const minDate = new Date(today);
  minDate.setFullYear(today.getFullYear() - 80);

  const mfidType = form.watch("mfid_type")
  const isOpen = mfidType === "open"

  const { provinces, cities, barangays } = useLguHierarchy(form)

  const resetAll = () => {
    form.reset()
    setStep(1)
  }

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) resetAll()
    onOpenChange(isOpen)
  }

  const handleCancel = () => {
    resetAll()
    onOpenChange(false)
  }

  const handleNext = () => {
    if (mfidType) {
      if (mfidType === "open") {
        form.setValue("farmer_first_name", "")
        form.setValue("farmer_last_name", "")
        form.setValue("farmer_gender", "male")
        form.setValue("farmer_date_of_birth", "")
        form.setValue("farmer_cellphone_no", "")
      }
      setStep(2)
    }
  }

  const handleBack = () => {
    setStep(1)
    form.reset({ mfid_type: mfidType })
  }

  const handleSubmit = (input: MfidFormInput) => {
    const { mfid_type, ...payload } = input
    onSubmit(payload)
    resetAll()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="default" disabled={disabled} className="min-w-32 text-xs">
          <Plus /> Create MFID
        </Button>
      </DialogTrigger>

      <DialogContent className="w-175 sm:max-w-none max-w-none">

        <div className="flex items-center gap-2 mb-1">
          {[1, 2].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={cn(
                  "w-6 h-6 rounded-full text-xs font-semibold flex items-center justify-center",
                  step === s
                    ? "bg-primary text-primary-foreground"
                    : step > s
                      ? "bg-primary/20 text-primary"
                      : "bg-muted text-muted-foreground"
                )}
              >
                {s}
              </div>
              {s < 2 && (
                <div className={cn("h-px w-8", step > s ? "bg-primary/40" : "bg-primary/15")} />
              )}
            </div>
          ))}
          <span className="text-xs text-muted-foreground ml-1">Step {step} of 2</span>
        </div>

        {step === 1 && (
          <>
            <DialogHeader className="mb-6 pb-4 border-b">
              <DialogTitle>Create MFID</DialogTitle>
              <DialogDescription>Select the type of MFID you want to create.</DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-2 gap-4 py-2">
              <MfidTypeCard
                selected={mfidType === "open"}
                onClick={() => form.setValue("mfid_type", "open")}
                title="Open MFID"
                description="Not yet linked to a specific farmer. Only requires a location."
              />
              <MfidTypeCard
                selected={mfidType === "assigned"}
                onClick={() => form.setValue("mfid_type", "assigned")}
                title="Assigned MFID"
                description="Directly tied to a specific farmer. Requires farmer and location details."
              />
            </div>

            <DialogFooter className="border-t mt-6 pt-4">
              <Button variant="outline" onClick={handleCancel}>Cancel</Button>
              <Button onClick={handleNext} disabled={!mfidType}>Next</Button>
            </DialogFooter>
          </>
        )}

        {step === 2 && (
          <Form form={form} onSubmit={handleSubmit}>
            <DialogHeader className="mb-6 pb-4 border-b">
              <DialogTitle>Create {isOpen ? "Open" : "Assigned"} MFID</DialogTitle>
              <DialogDescription>
                {isOpen
                  ? "Enter the location for this MFID."
                  : "Enter the farmer and location details for this MFID."}
              </DialogDescription>
            </DialogHeader>

            <FieldGroup>
              {!isOpen && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <FormTextField name="farmer_first_name" label="First Name" placeholder="Enter farmer first name"/>
                    <FormTextField name="farmer_last_name" label="Last Name" placeholder="Enter farmer last name"/>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <FormSelect
                      name="farmer_gender"
                      label="Gender"
                      placeholder="Select gender"
                      options={["Male", "Female", "Other"].map(opt => ({
                        label: opt,
                        value: opt.toLowerCase()
                      }))}
                    />
                    <FormDatePicker
                      name="farmer_date_of_birth"
                      label="Date of Birth"
                      minDate={minDate}
                      maxDate={maxDate}
                      initialValue={minDateOfBirth}
                    />
                    <FormTextField
                      name="farmer_cellphone_no"
                      label="Cellphone No."
                      placeholder="09171234567"
                    />
                  </div>
                </>
              )}

              <div className="grid grid-cols-3 gap-4">
                <FormSelect
                  name="province"
                  label="Province"
                  placeholder="Select a province"
                  options={provinces.map((p) => ({
                    label: p.name,
                    value: p.name
                  }))}
                />
                <FormSelect
                  name="city_municipality"
                  label="City / Municipality"
                  placeholder="Select a city/municipality"
                  options={cities.map((p) => ({
                    label: p.name,
                    value: p.name
                  }))}
                  disabled={!form.watch("province")}
                />
                <FormSelect
                  name="barangay"
                  label="Barangay"
                  placeholder="Select a barangay"
                  options={barangays.map((p) => ({
                    label: p.name,
                    value: p.name
                  }))}
                  disabled={!form.watch("city_municipality")}
                />
              </div>
            </FieldGroup>

            <DialogFooter className="border-t mt-6 pt-4">
              <Button type="button" variant="outline" onClick={handleBack}>Back</Button>
              <Button type="submit">Create MFID</Button>
            </DialogFooter>
          </Form>
        )}

      </DialogContent>
    </Dialog>
  )
}



interface MfidTypeCardProps {
  selected: boolean
  onClick: () => void
  title: string
  description: string
}

function MfidTypeCard({ selected, onClick, title, description }: MfidTypeCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-lg border-2 p-4 text-left transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        selected
          ? "border-primary bg-primary/5"
          : "border-muted hover:border-primary/40 hover:bg-muted/40"
      )}
    >
      <p className={cn("font-semibold text-sm mb-1", selected && "text-primary")}>{title}</p>
      <p className="text-xs text-muted-foreground leading-snug">{description}</p>
    </button>
  )
}
