import { Badge } from "@/core/components/ui/badge";
import { TabsContent } from "@/core/components/ui/tabs";
import { format, formatDistanceToNow } from "date-fns";
import {
  Calendar,
  Clock,
  Copy,
  Info,
  Mail,
  ShieldAlert,
  ShieldCheck,
  User as UserIcon,
} from "lucide-react";
import { User, UserFormInput, userFormInputSchema } from "../../schemas";
import { KVItem } from "@/core/components/KeyValue";
import { getRoleLabel } from "../../utils";
import { useUpdateUser } from "../../hooks/useUpdateUser";
import { Form } from "@/core/components/forms";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { UserFormContent } from "../UserFormDialog";
import { getDateString } from "@/core/utils/date";

interface UserDetailsOverviewViewProps {
  user: User;
  isEditing: boolean;
  onEditComplete: () => void;
  onUserUpdated?: (updatedUser: User) => void;
  onClose?: () => void;
}

export function UserDetailsOverviewView({
  user,
  isEditing,
  onEditComplete,
  onUserUpdated,
  onClose
}: UserDetailsOverviewViewProps) {

  const updateUser = useUpdateUser();

  const form = useForm<UserFormInput>({
    resolver: zodResolver(userFormInputSchema),
    defaultValues: {
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      role: user.role,
      date_of_birth: getDateString(user.date_of_birth),
    },
    mode: "onChange",
    reValidateMode: "onChange",
  });

  const onSubmit = async (data: UserFormInput) => {
    const payload = {
      userId: user.id,
      updates: {
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        role: data.role,
        date_of_birth: data.date_of_birth,
      },
    };

    try {
      const result = await updateUser.mutateAsync(payload);
      if (result?.user && onUserUpdated) {
        onUserUpdated(result.user);
      }
      onEditComplete();
      onClose?.();
    } catch (error) {
      // error handled by toast
    }
  };

  if (isEditing) {
    return (
      <TabsContent value="Overview" className="py-4">
        <Form form={form} onSubmit={onSubmit}>
          <UserFormContent submitLabel="Save User" />
        </Form>
      </TabsContent>
    );
  }

  // view mode
  return (
    <TabsContent value="Overview" className="py-4 flex-1 flex flex-col gap-4">
      <KVItem icon={<UserIcon className="size-4" />} pair={{ key: "Full Name", value: `${user.first_name} ${user.last_name}` }} />
      <KVItem
        icon={user.is_active ? <Info className="size-4" /> : <ShieldAlert className="size-4" />}
        pair={{ key: "Status", value: user.is_active ? "Active" : "Inactive" }}
      />
      <KVItem
        icon={<Mail className="size-4" />}
        pair={{
          key: "Email Address",
          value: (
            <div className="flex items-center gap-2">
              <span className="truncate">{user.email}</span>
              <button
                onClick={() => navigator.clipboard.writeText(user.email)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <Copy className="size-3" />
              </button>
            </div>
          ),
        }}
      />
      <KVItem
        icon={<ShieldCheck className="size-4" />}
        pair={{
          key: "Role",
          value: (
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-3xs py-1.5 px-2">{getRoleLabel(user.role)}</Badge>
            </div>
          ),
        }}
      />
      <KVItem
        icon={<Calendar className="size-4" />}
        pair={{ key: "Date of Birth", value: format(user.date_of_birth, "PPP") }}
      />
      <KVItem
        icon={<Clock className="size-4" />}
        pair={{
          key: "Last Sign In",
          value: user.last_sign_in_at
            ? `${format(user.last_sign_in_at, "PPP 'at' p")} (${formatDistanceToNow(user.last_sign_in_at, { addSuffix: true })})`
            : "Never",
        }}
      />
      <KVItem
        icon={<Calendar className="size-4" />}
        pair={{ key: "Member Since", value: format(user.created_at, "PPP") }}
      />
    </TabsContent>
  );
}
