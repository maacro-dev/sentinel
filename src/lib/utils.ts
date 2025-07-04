import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const isMobile = window.matchMedia("(max-width: 768px)").matches;

export const IS_DEV = import.meta.env.DEV;