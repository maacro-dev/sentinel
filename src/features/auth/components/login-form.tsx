import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { userCredentialsSchema } from "@/lib/schemas/user";
import { HumayForm, HumayTextField } from "@/components/forms";
import { UserCredentials } from "@/lib/schemas/user";
import HumayLogo from "@/components/logo";

type LoginFormProps = {
  onSubmit: (fields: UserCredentials) => void;
};

const LoginForm = ({ onSubmit }: LoginFormProps) => {
  const form = useForm<UserCredentials>({
    resolver: zodResolver(userCredentialsSchema),
    defaultValues: { username: "", password: "" }
  });

  return (
    <Card className="w-96">
      <CardHeader className="space-y-4">
        <HumayLogo />
        <div className="space-y-1">
          <CardTitle className="text-xl ">Login to your account</CardTitle>
          <CardDescription>Enter your credentials below to login</CardDescription>
        </div>
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
