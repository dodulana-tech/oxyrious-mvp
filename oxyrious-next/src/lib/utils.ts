import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const fmt = (n: number) =>
  n >= 1e6 ? `₦${(n / 1e6).toFixed(1)}M` : `₦${(n / 1000).toFixed(0)}K`;

export const fmtFull = (n: number) => `₦${n.toLocaleString()}`;
