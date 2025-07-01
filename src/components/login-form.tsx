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

type LoginFormProps = {
  onSubmit: (fields: UserCredentials) => void;
};

export const LoginForm = ({ onSubmit }: LoginFormProps) => {

  const form = useForm<UserCredentials>({
    resolver: zodResolver(userCredentialsSchema),
    defaultValues: { user_id: "", password: "" },
  });

  return (
    <Card className="w-96 shadow-none border-none">
      <CardHeader className="flex flex-col gap-4">
        <Logo />
        <div className="flex flex-col gap-1">
          <CardTitle>Login to your account</CardTitle>
          <CardDescription>Enter your credentials below to login</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <HumayForm form={form} onSubmit={onSubmit}>
          <HumayTextField
            name="user_id"
            label="User ID"
            placeholder="Enter your user ID"
            type="text"
          />
          <HumayTextField
            name="password"
            label="Password"
            placeholder="Enter your password"
            type="password"
          />
          <Button className="w-full">Login</Button>
        </HumayForm>
      </CardContent>
    </Card>
  );
};

