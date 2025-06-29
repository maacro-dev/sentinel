import { Leaf } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface LoginFormProps extends React.HTMLAttributes<HTMLFormElement> {
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

export function LoginForm({
  className,
  onSubmit,
  ...props
}: LoginFormProps) {
  return (
    <form className="w-80" onSubmit={onSubmit} {...props}>
    <div className="flex flex-col gap-6">
        <div className="flex flex-col items-start gap-2">
        <a
            href="/"

            className="flex flex-col items-center gap-2 font-medium"
        >
            <div className="flex size-10 items-center justify-center rounded-md bg-green-500 text-white">
            <Leaf className="size-6" />
            </div>
        </a>
        <h1 className="text-2xl font-bold">Welcome to Sentinel</h1>
        </div>
        <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-4">
            <div className="grid gap-1">
                <Label htmlFor="id" className="text-sm text-muted-foreground">User ID</Label>
                <Input
                id="id"
                type="text"
                placeholder="Enter your user ID"
                required
                />
            </div>
            <div className="grid gap-1">
                <Label htmlFor="password" className="text-sm text-muted-foreground">Password</Label>
                <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                required
                />
            </div>
        </div>
        <Button type="submit" className="w-full">
            Login
        </Button>
        </div>
    </div>
    </form>
  )
}
