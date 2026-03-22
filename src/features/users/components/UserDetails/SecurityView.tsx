import { Button } from "@/core/components/ui/button";
import { TabsContent } from "@/core/components/ui/tabs";
import { Mail, RefreshCw, KeyRound } from "lucide-react";
import { User } from "../../schemas";
import { useUpdateUser } from "../../hooks/useUpdateUser";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod/v4";
import { Form, FormTextField } from "@/core/components/forms";
import { useSendPasswordResetEmail } from "../../hooks/useSendPasswordReset";

const passwordChangeSchema = z
  .object({
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type PasswordChangeForm = z.infer<typeof passwordChangeSchema>;

interface UserDetailsSecurityViewProps {
  user: User;
  onClose?: () => void;
}

export function UserDetailsSecurityView({ user, onClose }: UserDetailsSecurityViewProps) {
  const updateUser = useUpdateUser();
  const { mutate: sendResetEmail, isPending: isSendingReset } = useSendPasswordResetEmail();

  const form = useForm<PasswordChangeForm>({
    resolver: zodResolver(passwordChangeSchema),
    defaultValues: { newPassword: "", confirmPassword: "" },
    mode: "onChange",
    reValidateMode: "onChange",
  });

  const onSubmit = async (data: PasswordChangeForm) => {
    await updateUser.mutateAsync({
      userId: user.id,
      updates: { password: data.newPassword },
    });
    form.reset();
    onClose?.();
  };

  const handleSendResetEmail = () => {
    sendResetEmail({ email: user.email });
  };

  return (
    <TabsContent value="Security" className="py-4 flex-1 flex flex-col gap-4 overflow-y-auto">
      <div className="rounded-md border p-4 space-y-2.5">
        <div className="flex items-center gap-2">
          <Mail className="size-4 text-muted-foreground" />
          <span className="text-sm font-medium">Send Password Reset Email</span>
        </div>
        <p className="text-xs text-muted-foreground">
          An email will be sent to <span className="font-medium text-foreground">{user.email}</span> with a link to reset their password.
        </p>
        <Button
          variant="outline"
          size="sm"
          className="h-8 text-xs gap-1.5"
          onClick={handleSendResetEmail}
          disabled={isSendingReset}
        >
          {isSendingReset ? (
            <RefreshCw className="size-3 animate-spin" />
          ) : (
            <RefreshCw className="size-3" />
          )}
          {isSendingReset ? "Sending..." : "Send Reset Email"}
        </Button>
      </div>

      <div className="rounded-md border p-4 space-y-4">
        <div className="flex items-center gap-2">
          <KeyRound className="size-4 text-muted-foreground" />
          <span className="text-sm font-medium">Set New Password</span>
        </div>
        <p className="text-xs text-muted-foreground">
          Manually set a new password for this user.
        </p>
        <Form form={form} onSubmit={onSubmit}>
          <div className="space-y-4">
            <FormTextField
              name="newPassword"
              label="New Password"
              type="password"
              placeholder="••••••••"
              className="text-xs"
            />
            <FormTextField
              name="confirmPassword"
              label="Confirm Password"
              type="password"
              placeholder="••••••••"
              className="text-xs"
            />
            <Button
              type="submit"
              size="sm"
              className="h-8 text-xs gap-1.5 w-full"
              disabled={updateUser.isPending}
            >
              {updateUser.isPending ? "Updating..." : "Update Password"}
            </Button>
          </div>
        </Form>
      </div>
    </TabsContent>
  );
}
