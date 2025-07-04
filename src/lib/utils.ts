import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const isMobile = window.matchMedia("(max-width: 768px)").matches;

export function formatDate(
  date: Date,
  locale: string = 'en-US',
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }
): string {

  if (!(date instanceof Date) || isNaN(date.getTime())) {
    throw new Error('Invalid Date object');
  }

  return new Intl.DateTimeFormat(locale, options).format(date);
}


export const IS_DEV = import.meta.env.DEV;