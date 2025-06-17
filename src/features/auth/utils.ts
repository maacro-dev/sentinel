import { Role } from "@/lib/types";

export function getRedirectPath(role: Role) {
  switch (role) {
    case "admin":
      return "/admin";
    case "data_manager":
      return "/dashboard";
    default:
      return "/";
  }
}
