import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/core/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/core/components/ui/card";
import { useRouterState } from "@tanstack/react-router";
import { Spinner } from "../../../core/components/ui/spinner";
import { HumayLogo } from "@/core/components/HumayLogo";
import { Credentials, credentialsSchema } from "../schemas";
import { Form, FormTextField } from "@/core/components/forms";

type LoginFormProps = {
  onSubmit: (credentials: Credentials) => void;
};

export const LoginForm = ({ onSubmit }: LoginFormProps) => {

  const status = useRouterState({ select: s => s.status });

  const form = useForm<Credentials>({
    resolver: zodResolver(credentialsSchema),
    defaultValues: { email: "", password: "" },
    mode: "onChange",
    reValidateMode: "onChange",
  });

  return (
    <Card className="min-w-96 gap-8 shadow-none border-none bg-transparent">
      <CardHeader className="flex flex-col gap-4 w-full max-w-96">
        <HumayLogo />
        <div className="flex flex-col gap-2">
          <CardTitle className="text-3xl">Login to your account</CardTitle>
          <CardDescription>Enter your credentials below to login</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="my-2 max-w-96">
        <Form form={form} onSubmit={onSubmit}>
          <FormTextField name="email" label="Email" placeholder="Enter your email"/>
          <FormTextField name="password" label="Password" placeholder="Enter your password" type="password"/>
          <Button className="w-full relative h-10 mt-2">
            {status === 'pending' ? (
              <Spinner className="size-5 text-background"/>
            ) : (
              "Login"
            )}
          </Button>
        </Form>
      </CardContent>
    </Card>
  );
};
