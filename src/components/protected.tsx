// import { useAuth } from "@/context/auth-context";
// import { roleHasAccess } from "@/features/auth/utils";
// import { useNavigate } from "@tanstack/react-router";
// import { Role } from "@/lib/types";

// type ProtectedRouteProps = {
//   children: React.ReactNode;
//   allowedRoles: Role[];
// };

// export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
//   const { user, logout } = useAuth();
//   const navigate = useNavigate();

//   if (!user || !roleHasAccess(user.role, allowedRoles)) {
//     console.log("Protected Route: User not authenticated or role not allowed");
//     console.log("Logging out...");
//     logout();
//     navigate({ to: "/login" });
//     return null;
//   }

//   return <>{children}</>;
// }
