import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { Role } from "./schemas/user";

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
      return "Error";
  }
};

export const isMobile = window.matchMedia("(max-width: 768px)").matches;