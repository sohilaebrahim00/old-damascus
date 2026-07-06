import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { restaurant } from "@/config/restaurant";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Format a number as USD price string */
export function formatPrice(amount: number): string {
  return new Intl.NumberFormat(restaurant.locale, {
    style: "currency",
    currency: restaurant.currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/** Format cents as USD price string */
export function formatCents(cents: number): string {
  return formatPrice(cents / 100);
}

/** Truncate text to a given length */
export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.substring(0, length).trim() + "…";
}

/** Check if a social URL is a valid (non-placeholder) URL */
export function isSocialUrlValid(url: string): boolean {
  return url !== "TO_BE_PROVIDED_BY_CLIENT" && url.startsWith("http");
}

/** Get current year for copyright */
export function currentYear(): number {
  return new Date().getFullYear();
}

/** Convert a slug to a display name */
export function slugToTitle(slug: string): string {
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
