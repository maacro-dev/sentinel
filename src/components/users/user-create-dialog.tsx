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
import { HumayForm, HumayRoleSelect, HumayTextField } from "@/components/forms";
import { userCreateSchema } from "@/lib/schemas/user";
import { UserCreate } from "@/lib/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Separator } from "@/components/ui/separator";

interface AddUserFormProps {
  onSubmit: (fields: UserCreate) => void;
}

export function AddUserForm({ onSubmit }: AddUserFormProps) {
  const form = useForm<UserCreate>({
    resolver: zodResolver(userCreateSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      username: "",
      status: "active",
      email: "",
    },
  });

  return (
    <Dialog>
      <HumayForm form={form} onSubmit={onSubmit}>
        <DialogTrigger asChild>
          <Button variant="default">
            <Plus />
            Add User
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add User</DialogTitle>
            <DialogDescription>Add a new user to the system.</DialogDescription>
          </DialogHeader>
          <Separator className="mb-0.5 bg-transparent" />
          <div className="flex gap-4 h-full">
            <div className="flex flex-col gap-4 ">
              <HumayTextField
                name="username"
                label="Username"
                placeholder="Enter your username"
                type="text"
              />
              <HumayTextField
                name="email"
                label="Email"
                placeholder="Enter your email"
                type="email"
              />
            </div>
            <Separator className="opacity-60 h-full" orientation="vertical" />
            <div className="flex flex-col gap-4">
              <HumayTextField
                name="first_name"
                label="First Name"
                placeholder="Enter your first name"
                type="text"
              />
              <HumayTextField
                name="last_name"
                label="Last Name"
                placeholder="Enter your last name"
                type="text"
              />
              <HumayRoleSelect name="role" label="Role" placeholder="Select a role" />
            </div>
          </div>
          <Separator className="mb-0.5 bg-transparent" />
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit">Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </HumayForm>
    </Dialog>
  );
}
