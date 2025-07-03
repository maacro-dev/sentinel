import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { HumayDatePicker, HumayForm, HumayRoleSelect, HumayTextField } from "@/components/forms";
import { userCreateSchema } from "@/lib/schemas/user";
import { UserCreate } from "@/lib/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { generateUserIdQueryOptions } from "@/api/users";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useEffect } from "react";

interface AddUserFormProps {
  onSubmit: (fields: UserCreate) => void;
}

export function AddUserForm({ onSubmit }: AddUserFormProps) {

  const { data: userId, isLoading: isLoadingUserId } = useSuspenseQuery(generateUserIdQueryOptions())


  // Set user id when it is generated [should refactor]
  useEffect(() => {
    if (userId && !form.getValues().user_id) {
      form.reset({ ...form.getValues(), user_id: userId })
    }
  }, [userId])

  const form = useForm<UserCreate>({
    resolver: zodResolver(userCreateSchema),
    defaultValues: {
      user_id: userId,
      first_name: "",
      last_name: "",
      role: "data_manager",
      email: "",
      date_of_birth: "",
    },
  });

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="default">
          <Plus />
          Add User
        </Button>
      </DialogTrigger>
      <DialogContent className="p-6 max-w-lg">
        <HumayForm form={form} onSubmit={onSubmit}>
          <DialogHeader>
            <DialogTitle>Add User</DialogTitle>
            <DialogDescription>
              Add a new user to the system.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-4">
              <HumayTextField
                name="user_id"
                label="User ID"
                type="text"
                note="Auto-generated"
                disabled
                placeholder={isLoadingUserId ? 'Loading...' : undefined}
              />
              <HumayTextField
                name="email"
                label="Email"
                placeholder="user@humayapp.com"
                type="email"
              />
              <HumayRoleSelect
                name="role"
                label="Role"
                placeholder="Choose a role"
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
              <HumayDatePicker name="date_of_birth" label="Date of Birth" />
            </div>
          </div>
          <DialogFooter className="pt-2">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit">Save changes</Button>
          </DialogFooter>
        </HumayForm>
      </DialogContent>
    </Dialog>
  );
}
