import { CenteredLayout } from "@/core/components/Centered";
import { HumayLogo } from "@/core/components/HumayLogo";
import { zodResolver } from "@hookform/resolvers/zod";
import { Motion } from "@/core/components/Motion";
import { DEFAULT_FADE_UP } from "@/core/utils/motions";
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { getSupabase } from "@/core/supabase";
import { Button } from "@/core/components/ui/button";
import { Form, FormTextField } from "@/core/components/forms";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/core/components/ui/card";
import { useToast } from "@/features/toast";
import { useForm } from "react-hook-form";
import * as z from "zod/v4";
import { Spinner } from "@/core/components/ui/spinner";

const resetPasswordSchema = z
  .object({
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(8, "Please confirm your password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ResetPasswordForm = z.infer<typeof resetPasswordSchema>;

export const Route = createFileRoute('/reset-password')({
  component: RouteComponent,
  loader: async () => {
    const hash = window.location.hash.slice(1);
    const params = new URLSearchParams(hash);

    const error = params.get("error") ?? undefined;
    const accessToken = params.get('access_token') ?? "";
    const refreshToken = params.get('refresh_token') ?? "";

    if (error != undefined) {
      throw redirect({ to: "/unauthorized" });
    }

    const supabase = await getSupabase();
    const { data: { user, session } } = await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });

    return { user, session };
  },
  head: () => ({ meta: [{ title: "Reset Password | Humay" }] }),
});

function RouteComponent() {
  const { user } = Route.useLoaderData();
  const navigate = useNavigate();
  const { notifySuccess, notifyError } = useToast();

  const form = useForm<ResetPasswordForm>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { newPassword: "", confirmPassword: "" },
    mode: "onChange",
    reValidateMode: "onChange",
  });

  const isSubmitting = form.formState.isSubmitting;

  const onSubmit = async (data: ResetPasswordForm) => {
    console.log("Submitting")
    try {
      const supabase = await getSupabase();
      const { error } = await supabase.auth.updateUser({ password: data.newPassword });

      if (error) throw error;

      notifySuccess({ message: "Password updated successfully. Please log in with your new password." });
      navigate({ to: "/login" });
    } catch (err: any) {
      notifyError({ message: err.message || "Failed to update password." });
    }
  };

  return (
    <CenteredLayout>
      <Motion motion={DEFAULT_FADE_UP} className="flex-center">
        <Card className="min-w-96 gap-8 shadow-none border-none bg-transparent">
          <CardHeader className="flex flex-col gap-4 w-full max-w-96">
            <HumayLogo />
            <div className="flex flex-col gap-2">
              <CardTitle>Reset Your Password</CardTitle>
              <CardDescription>
                Enter a new password for <span className="font-medium">{user?.email}</span>
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="my-2 max-w-96">
            <Form form={form} onSubmit={onSubmit}>
              <FormTextField
                name="newPassword"
                label="New Password"
                placeholder="Enter new password"
                type="password"
                required
              />
              <FormTextField
                name="confirmPassword"
                label="Confirm Password"
                placeholder="Confirm new password"
                type="password"
                required
              />
              <Button type="submit" className="w-full relative h-10 mt-2">
                {isSubmitting ? (
                  <Spinner className="size-5 text-background" />
                ) : (
                  "Update Password"
                )}
              </Button>
            </Form>
          </CardContent>
        </Card>
      </Motion>
    </CenteredLayout>
  );
}
