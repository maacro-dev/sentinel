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
import { loginFormSchema, LoginFields } from "../schema/schema";
import { HumayForm, HumayTextField } from "@/components/forms";

type LoginFormProps = {
  onSubmit: (fields: LoginFields) => void;
};

const LoginForm = ({ onSubmit }: LoginFormProps) => {
  const form = useForm<LoginFields>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: { username: "", password: "" },
  });

  return (
    <Card className="w-96">
      <CardHeader>
        <CardTitle>Login to your account</CardTitle>
        <CardDescription>Enter your credentials below to login</CardDescription>
      </CardHeader>
      <CardContent>
        <HumayForm form={form} onSubmit={onSubmit}>
          <HumayTextField
            name="username"
            label="Username"
            placeholder="Enter your username"
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

export default LoginForm;
