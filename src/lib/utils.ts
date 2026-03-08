import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function gradeToLabel(value: number): string {
  switch (value) {
    case 4: return "4";
    case 3: return "3";
    case 2: return "2";
    case 1: return "1";
    default: return "?";
  }
}

export function gradeToColor(value: number): string {
  switch (value) {
    case 4: return "text-green-400";
    case 3: return "text-yellow-400";
    case 2: return "text-orange-400";
    case 1: return "text-red-500";
    default: return "text-muted-foreground";
  }
}

export function gradeToBg(value: number): string {
  switch (value) {
    case 4: return "bg-green-500/20 border-green-500/40";
    case 3: return "bg-yellow-500/20 border-yellow-500/40";
    case 2: return "bg-orange-500/20 border-orange-500/40";
    case 1: return "bg-red-500/20 border-red-500/40";
    default: return "bg-muted";
  }
}
