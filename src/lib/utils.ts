import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { Role } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const mapRole = (role?: Role) => {
  if (!role) return "";
  switch (role) {
    case "admin":
      return "Admin";
    case "data_manager":
      return "Data Manager";
    default:
      return "User";
  }
};
