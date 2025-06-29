import { LoginForm } from "@/components/login-form";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/login")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<div className="flex flex-col items-center justify-center h-screen">
			<LoginForm
				onSubmit={() => {
					console.log("submit");
				}}
			/>
		</div>
	);
}
