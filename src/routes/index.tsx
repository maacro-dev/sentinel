import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  beforeLoad: ({ context }) => {
    const { role } = context.auth;
    switch (role) {
      case "admin":
        return redirect({ to: "/admin/dashboard", reloadDocument: true });
      case "data_manager":
        return redirect({ to: "/dashboard", reloadDocument: true });
      default:
        return redirect({ to: "/login", reloadDocument: true });
    }
  },
  component: () => null,
});
