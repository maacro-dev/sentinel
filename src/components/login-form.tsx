import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { HumayForm, HumayTextField } from "@/components/forms";
import { UserCredentials } from "@/lib/types";
import { userCredentialsSchema } from "@/lib/schemas/user";
import Logo from "./logo";
import { useRouterState } from "@tanstack/react-router";
import { Spinner } from "./ui/spinner";

type LoginFormProps = {
  onSubmit: (fields: UserCredentials) => void;
};

export const LoginForm = ({ onSubmit }: LoginFormProps) => {

  const status = useRouterState({ select: s => s.status });

  const form = useForm<UserCredentials>({
    resolver: zodResolver(userCredentialsSchema),
    defaultValues: { email: "", password: "" },
  });

  return (
    <Card className="min-w-96 gap-8 shadow-none border-none bg-transparent">
      <CardHeader className="flex flex-col gap-4 w-full max-w-96">
        <Logo />
        <div className="flex flex-col gap-2">
          <CardTitle className="text-3xl">Login to your account</CardTitle>
          <CardDescription>Enter your credentials below to login</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="my-2 max-w-96">
        <HumayForm form={form} onSubmit={onSubmit}>
          <HumayTextField
            name="email"
            label="Email"
            placeholder="Enter your email"
            type="text"
          />
          <HumayTextField
            name="password"
            label="Password"
            placeholder="Enter your password"
            type="password"
          />
          <Button className="w-full relative h-10 mt-2">
            {status === 'pending' ? (
              <Spinner className="size-5 text-background"/>
            ) : (
              "Login"
            )}
          </Button>
        </HumayForm>
      </CardContent>
    </Card>
  );
};

