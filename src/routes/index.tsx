import { Button } from "@/components/ui/button";
import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
	component: App,
});

function App() {
	return (
		<div className="flex flex-col items-center justify-center h-screen ">
      <div className="flex flex-col items-start justify-start gap-6">
        <div>
          <p className="text-sm text-muted-foreground">branch</p>
          <h1 className="text-3xl font-bold">prototype/secondary</h1>
        </div>
        <Link to="/login">
        <Button variant="default" size="lg">Login</Button>
        </Link>
      </div>
		</div>
	);
}
