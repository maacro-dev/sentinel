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
import { useForm } from "react-hook-form"
import {
  UserFormInput,
  userFormInputSchema
} from "@/features/users/schemas/userFormInput"
import {
  Form,
  FormTextField,
  FormDatePicker
} from "@/core/components/forms"
import { FormRoleToggle } from "@/core/components/forms/FormRoleToggle"

interface UserFormDialogProps {
  onSubmit: (input: UserFormInput) => void
  disabled?: boolean,
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UserFormDialog({
  onSubmit,
  disabled,
  open,
  onOpenChange
}: UserFormDialogProps) {
  const form = useForm<UserFormInput>({
    resolver: zodResolver(userFormInputSchema),
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: {
      first_name: "random",
      last_name: "random",
      date_of_birth: new Date().toISOString().slice(0, 10),
      email: "random@name.com",
      role: "data_collector",
    },
  })

  const submit = (input: UserFormInput) => {
    onSubmit(input)
    form.reset()
  }

  return (
    <Dialog open={open} onOpenChange={(v) => {
      form.reset()
      onOpenChange(v)
    }}>
      <DialogTrigger asChild>
        <Button variant="default" disabled={disabled} className="min-w-32">
          <Plus /> Add New User
        </Button>
      </DialogTrigger>
      <DialogContent className="font-jetbrains-mono">
        <Form form={form} onSubmit={submit}>
          <DialogHeader>
            <DialogTitle className="text-2xl">Add User</DialogTitle>
            <DialogDescription>
              {/* some description */}
            </DialogDescription>
          </DialogHeader>
            <div>
              <div className="flex flex-col gap-4">
                <div className="flex gap-4">
                  <FormTextField
                    containerClassName="flex-1"
                    name="first_name"
                    label="First Name"
                    placeholder="e.g. Lebron"
                  />
                  <FormTextField
                    containerClassName="flex-1"
                    name="last_name"
                    label="Last Name"
                    placeholder="e.g. James"
                  />
                </div>
                <FormTextField
                  name="email"
                  label="Email"
                  placeholder="user@humayapp.com"
                  type="email"
                />
                <div className="flex gap-4 w-full">
                  <FormDatePicker name="date_of_birth" label="Date of Birth"/>
                  <FormRoleToggle name="role" label="Role" options={{
                    data_collector: true,
                    data_manager: false
                  }}/>
                </div>
            </div>
            <DialogFooter className="py-6 flex justify-between">
              <Button type="submit">Create User</Button>
            </DialogFooter>
          </div>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
