import { LoginForm } from "@/components/login-form";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/login")({
	component: RouteComponent,
});

function RouteComponent() {

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget
    const formData = new FormData(form);

    const id = formData.get("id") as string;
    const password = formData.get("password") as string;

    console.log(id, password);
  };

	return (
		<div className="flex flex-col items-center justify-center h-screen">
			<LoginForm
				onSubmit={handleSubmit}
			/>
		</div>
	);
}
