"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import {
  HumayDatePicker,
  HumayForm,
  HumayTextField,
} from "@/components/forms"
import { userCreateSchema } from "@/lib/schemas/user"
import { Role, UserCreate } from "@/lib/types"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { useState } from "react"
import { Tabs, TabsContent } from "../ui/tabs"

export function CreateUserDialog({
  onSubmit,
  disabled,
}: {
  onSubmit: (data: UserCreate) => void
  disabled?: boolean
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [step, setStep] = useState<"1" | "2">("1")

  const form = useForm<UserCreate>({
    resolver: zodResolver(userCreateSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      role: "pending",
      date_of_birth: new Date().toISOString().slice(0, 10),
    },
  })

  const openChange = (open: boolean) => {
    setIsOpen(open)
    if (!open) {
      setStep("1")
      form.reset()
    }
  }

  const chooseRole = (r: Role) => {
    form.setValue("role", r)
    setStep("2")
  }

  const goBack = () => {
    form.reset()
    setStep("1")
  }

  const submit = (data: UserCreate) => {
    onSubmit(data)
    setIsOpen(false)
    setStep("1")
    form.reset()
  }

  return (
    <Dialog open={isOpen} onOpenChange={openChange}>
      <DialogTrigger asChild>
        <Button variant="default" disabled={disabled}>
          <Plus /> Add User
        </Button>
      </DialogTrigger>
      <DialogContent className="p-0 overflow-hidden min-h-72">
        <HumayForm form={form} onSubmit={submit}>
          <DialogHeader className="p-6 mb-0">
            <DialogTitle className="text-2xl">Add User</DialogTitle>
            <DialogDescription>
              {step === "1"
                ? "Choose a role for the new user."
                : "Enter user details and submit."}
            </DialogDescription>
          </DialogHeader>
          <Tabs defaultValue="1" onValueChange={(v) => setStep(v as "1" | "2")} value={step}>
            <TabsContent value="1" className="p-4">
              <div>
                <div className="flex flex-col gap-4 px-6 pb-6">
                  {["data_manager", "data_collector"].map((r) => (
                    <Button
                      key={r}
                      type="button"
                      variant="outline"
                      className="w-full py-6"
                      onClick={() => chooseRole(r as Role)}
                    >
                      {r.replace("_", " ").replace(/\b\w/g, (c) =>
                        c.toUpperCase()
                      )}
                    </Button>
                  ))}
                </div>
              </div>
            </TabsContent>
            <TabsContent value="2" className="p-4">
              <div>
                <div className="grid grid-cols-2 gap-4 px-6">
                  <div className="flex flex-col gap-4">
                    <HumayTextField
                      name="email"
                      label="Email"
                      placeholder="user@humayapp.com"
                      type="email"
                    />
                    <HumayDatePicker
                      name="date_of_birth"
                      label="Date of Birth"
                    />
                  </div>

                  <div className="flex flex-col gap-4">
                    <HumayTextField
                      name="first_name"
                      label="First Name"
                      placeholder="e.g. Lebron"
                      type="text"
                    />
                    <HumayTextField
                      name="last_name"
                      label="Last Name"
                      placeholder="e.g. James"
                      type="text"
                    />
                  </div>
                </div>
                <DialogFooter className="py-6 px-6 flex justify-between">
                  <Button
                    variant="secondary"
                    type="button"
                    onClick={goBack}
                  >
                    Back
                  </Button>
                  <Button type="submit">Create User</Button>
                </DialogFooter>
              </div>
            </TabsContent>
          </Tabs>
        </HumayForm>
      </DialogContent>
    </Dialog>
  )
}
