import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
	component: App,
});

function App() {
	return (
		<div className="flex flex-col items-center justify-center h-screen">
			<p>branch</p>
			<h1 className="text-2xl font-bold">prototype/secondary</h1>
		</div>
	);
}
